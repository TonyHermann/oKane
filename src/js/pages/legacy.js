import { categories } from "../../../public/data/categories.js";
// import { assistant } from "../../main.js";
import { Assistant } from "../components/Assistant.js";
const assistant = new Assistant(); 

export const runLegacy = async () => {
  const url = "../public/data/test2.txt";
  const $main = document.querySelector(".legacy");

  const getData = async (url) => {
    let dataFinal = "";
    await fetch(url)
      .then((response) => {
        console.log(response);
        console.log(typeof response);
        return response.text();
      })
      .then((data) => {
        dataFinal = data
          .split("\r\n")
          .filter((row) => row.trim() !== "") // Filtrar filas vacías
          .map((row) => {
            const [date, description, amount] = row.split("\t");
            if (date && description && amount) {
              return { date, description, amount: Number(amount) };
            }
          });
      });
    return dataFinal.slice(1, dataFinal.length);
  };

  // Función para determinar la categoría de un gasto en función de su descripción
  function getCategory(description, categorias) {
    for (const category of categorias) {
      if (
        category.keywords.some((keyword) =>
          description.toLowerCase().includes(keyword.toLowerCase()),
        )
      ) {
        return category.name;
      }
    }
    return null;
  }

  // Genera un objeto "categorias" vacío.
  function generarObjeto(categorias) {
    let obj = {};
    for (let categoria in categorias) {
      if (categorias[categoria].name != undefined) {
        obj[categorias[categoria].name] = [];
      }
    }
    return obj;
  }
  var sinCat = [];
  // Filtra y ordena el array de transacciones en un objeto con sus respectivas categorias.
  function dividirArrEnCategorias(arr, categorias) {
    return arr.reduce((gastos, gasto) => {
      const categoria = getCategory(gasto.description, categorias);
      if (categoria) {
        if (gastos[categoria]) {
          gastos[categoria].push(gasto);
        } else {
          gastos[categoria] = [];
          gastos[categoria].push(gasto);
        }
      } else {
        if (gastos["Sin categoria"]) {
          gastos["Sin categoria"].push(gasto);
          if (sinCat.indexOf(gasto.description) == -1) {
            sinCat.push(gasto.description);
          }
        } else {
          gastos["Sin categoria"] = [];
          gastos["Sin categoria"].push(gasto);
          if (sinCat.indexOf(gasto.description) == -1) {
            sinCat.push(gasto.description);
          }
        }
      }
      return gastos;
    }, generarObjeto(categorias));
  }

  function dividirPorFecha(transaccionesPorCat) {
    let transOrdenadas = {};

    for (const categoria in transaccionesPorCat) {
      if (
        Object.prototype.hasOwnProperty.call(transaccionesPorCat, categoria)
      ) {
        const element = transaccionesPorCat[categoria];
        element.forEach((transaccion) => {
          let fecha = transaccion.date.split("/");
          let [dia, mes, anio] = fecha;

          transOrdenadas[anio] = transOrdenadas[anio] || {};
          transOrdenadas[anio][mes] = transOrdenadas[anio][mes] || {};
          transOrdenadas[anio][mes][categoria] =
            transOrdenadas[anio][mes][categoria] || [];

          transOrdenadas[anio][mes][categoria].push(transaccion);
        });
      }
    }

    return transOrdenadas;
  }

  function calcularMontoTotal(data) {
    Object.keys(data).forEach((anio) => {
      Object.keys(data[anio]).forEach((mes) => {
        Object.keys(data[anio][mes]).forEach((categoria) => {
          data[anio][mes][categoria]["total"] = (
            Math.round(
              data[anio][mes][categoria].reduce(
                (acc, el) => acc + el.amount,
                0,
              ) * 100,
            ) / 100
          ).toFixed(2);
          data[anio][mes]["total"] = data[anio][mes]["total"] || 0;
          data[anio][mes]["total"] =
            data[anio][mes]["total"] +
            Number(data[anio][mes][categoria]["total"]);
        });

        data[anio]["total"] = data[anio]["total"] || 0;
        data[anio]["total"] = data[anio]["total"] + data[anio][mes]["total"];
      });

      data["total"] = data["total"] || 0;
      data["total"] = data["total"] + data[anio]["total"];
    });

    console.log(data);
    return data;
  }

  function render(data) {
    let html = `
      ${Object.entries(data)
        .map(([anio]) => {
          if (anio == "total") {
            return "";
          }
          return `
            <div id="section_${anio}" class="section_año">
              <h3>${anio}</h3>
              <div class="tablas_wrapper">
              ${Object.entries(data[anio])
                .map(([mes]) => {
                  if (mes == "total") {
                    return "";
                  }
                  return `
                  <div class="'mes_${mes} section_mes">
                    <h4>Mes ${mes}</h4>
                      <table class="tabla_movimientos">
                      <thead>
                        <tr>
                          <td>Descripcion</td>
                          <td>Monto</td>
                        </tr>
                      </thead>
                      <tbody>
                        ${Object.entries(data[anio][mes])
                          .map(([transaccion]) => {
                            if (transaccion == "total") {
                              return "";
                            }
                            return `
                              <tr>
                                <td>
                                  <ul class="tree-view">
                                    <li>
                                      <details closed>
                                        <summary>${transaccion}</summary>
                                        <ul>
                                          ${Object.entries(
                                            data[anio][mes][transaccion],
                                          )
                                            .map(([movimiento]) => {
                                              let itm =
                                                data[anio][mes][transaccion][
                                                  movimiento
                                                ];
                                              if (itm["date"]) {
                                                return `<li>${itm["date"]} - ${itm["description"]} - ${itm["amount"]}</li>`;
                                              } else {
                                                return "";
                                              }
                                            })
                                            .join("")}
                                        </ul>
                                      </details>
                                    </li>
                                  </ul>
                                </td>
                                <td>
                                  ${data[anio][mes][transaccion]["total"]}
                                </td>
                              </tr>
                              `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                    </div>
                    `;
                })
                .join("")}
                    </div>
            </div>
            `;
        })
        .join("")}
      `;

    // handleMiniPanel()

    const $balanceActual = document.querySelector(".balance_actual");
    assistant.say(`Monto total ${data.total}`);
    $main.innerHTML = html;
    // $balanceActual.innerHTML = data.total;
  }

  const handleMiniPanel = () => {
    const $miniPanel = document.querySelector(".mini-panel");
    if ($miniPanel !== null) {
      return;
    }

    const $panel = document.querySelector(".globo_texto");
    let htmlBalance = `<div class="mini-panel">
        <span class="balance_actual_father"><span class="balance_actual">0.00</span><span>€</span></span>
        <span class="cuenta_actual">Cuenta Principal</span>
      </div>`;
    let div_ = document.createElement("div");
    div_.innerHTML = htmlBalance;
    $panel.appendChild(div_);
  };

  let data = await getData(url);
  let sum = data.reduce((acc, el) => acc + Number(el.amount), 0);
  let dataFiltrada = dividirPorFecha(dividirArrEnCategorias(data, categories));
  console.log(sinCat);
  dataFiltrada = calcularMontoTotal(dataFiltrada);
  render(dataFiltrada);
  console.log("asd");
};
