import { Assistant } from "../components/Assistant.js";
import { categoryStore } from "../store/categoryStore.js";
import { transactionStore } from "../store/transactionStore.js";
import { fetchTransactions } from "../services/transactionService.js";
import { fetchCategories } from "../services/categoryService.js";
import { Modal } from "../components/Modal.js";
import { updateCategory } from "../services/categoryService.js";

const assistant = new Assistant();

export const runLegacy = async () => {
  await fetchTransactions();
  console.log(transactionStore.getState());
  await fetchCategories();
  console.log(categoryStore.getState());

  const url = "../data/test3.txt";
  // const url = "/data_public/test2.txt";
  const $main = document.querySelector(".legacy");
  const categories = categoryStore.getState();

  const getData = async (url) => {
    let dataFinal = "";
    await fetch(url)
      .then((response) => {
        // console.log(response);
        // console.log(typeof response);
        return response.text();
      })
      .then((data) => {
        // console.log("data")
        // console.log(data)
        dataFinal = data
          .split("\n")
          .filter((row) => row.trim() !== "") // Filtrar filas vacías
          .map((row) => {
            // console.log(row)
            const [date, description, amount] = row.split("\t");
            if (date && description && amount) {
              return { date, description, amount: Number(amount) };
            }
          });
        // console.log(dataFinal)
      });

    return dataFinal.slice(1, dataFinal.length);
  };

  // Función para determinar la categoría de un gasto en función de su descripción
  function getCategory(description, categorias) {
    for (const category of categorias) {
      if (category.keywords.some((keyword) => description.toLowerCase().includes(keyword.toLowerCase()))) {
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
  // function dividirArrEnCategorias(arr, categorias) {
  //   return arr.reduce((gastos, gasto) => {
  //     const categoria = getCategory(gasto.description, categorias);
  //     if (categoria) {
  //       if (gastos[categoria]) {
  //         gastos[categoria].push(gasto);
  //       } else {
  //         gastos[categoria] = [];
  //         gastos[categoria].push(gasto);
  //       }
  //     } else {
  //       if (gastos["Sin categoria"]) {
  //         gastos["Sin categoria"].push(gasto);
  //         if (sinCat.indexOf(gasto.description) == -1) {
  //           sinCat.push(gasto.description);
  //         }
  //       } else {
  //         gastos["Sin categoria"] = [];
  //         gastos["Sin categoria"].push(gasto);
  //         if (sinCat.indexOf(gasto.description) == -1) {
  //           sinCat.push(gasto.description);
  //         }
  //       }
  //     }
  //     return gastos;
  //   }, generarObjeto(categorias));
  // }

  function dividirArrEnCategorias(arr, categorias) {
    return arr.reduce((gastos, gasto) => {
      const categoria = getCategory(gasto.description, categorias) || "Sin categoria";

      if (!gastos[categoria]) gastos[categoria] = [];
      gastos[categoria].push(gasto);

      if (categoria === "Sin categoria" && !sinCat.includes(gasto.description)) {
        sinCat.push(gasto.description);
      }

      return gastos;
    }, generarObjeto(categorias));
  }

  function dividirPorFecha(transaccionesPorCat) {
    let transOrdenadas = {};

    for (const categoria in transaccionesPorCat) {
      if (Object.prototype.hasOwnProperty.call(transaccionesPorCat, categoria)) {
        const element = transaccionesPorCat[categoria];
        element.forEach((transaccion) => {
          let fecha = transaccion.date.split("/");
          let [dia, mes, anio] = fecha;

          transOrdenadas[anio] = transOrdenadas[anio] || {};
          transOrdenadas[anio][mes] = transOrdenadas[anio][mes] || {};
          transOrdenadas[anio][mes][categoria] = transOrdenadas[anio][mes][categoria] || [];

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
            Math.round(data[anio][mes][categoria].reduce((acc, el) => acc + el.amount, 0) * 100) / 100
          ).toFixed(2);
          data[anio][mes]["total"] = data[anio][mes]["total"] || 0;
          data[anio][mes]["total"] = data[anio][mes]["total"] + Number(data[anio][mes][categoria]["total"]);
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
    let anios = Object.entries(data);
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
                            if (transaccion == "Sin categoria") {
                              return `
                              <tr>
                                <td>
                                  <ul class="tree-view">
                                    <li>
                                      <details closed>
                                        <summary>${transaccion}</summary>
                                        <ul>
                                          ${Object.entries(data[anio][mes][transaccion])
                                            .map(([movimiento]) => {
                                              let itm = data[anio][mes][transaccion][movimiento];
                                              if (itm["date"]) {
                                                return `
                                                <li>
                                                  <div>
                                                    <span>${itm["date"]} - ${itm["description"]} - ${itm["amount"]}</span>
                                                    <div class='keyword-buttons'>
                                                        <span data-action='add' data-keyword='${itm["description"]}'><img src='../img/pifedit.ico' alt='Añadir a...' title='Añadir a...'></span>
                                                    </div>
                                                  </div>
                                                </li>
                                                `;
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
                            }
                            return `
                              <tr>
                                <td>
                                  <ul class="tree-view">
                                    <li>
                                      <details closed>
                                        <summary>${transaccion}</summary>
                                        <ul>
                                          ${Object.entries(data[anio][mes][transaccion])
                                            .map(([movimiento]) => {
                                              let itm = data[anio][mes][transaccion][movimiento];
                                              if (itm["date"]) {
                                                return `
                                                <li>${itm["date"]} - ${itm["description"]} - ${itm["amount"]}</li>
                                                `;
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

    assistant.say(`Monto total ${data.total}`);
    $main.innerHTML = html;
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

  // let data = await getData(url);

  const renderClean = () => {
    let data = transactionStore.getState();
    let dataFiltrada = dividirPorFecha(dividirArrEnCategorias(data, categories));
    console.log(sinCat);
    dataFiltrada = calcularMontoTotal(dataFiltrada);
    render(dataFiltrada);
  };
  renderClean();
  // categoryStore.subscribe(renderClean);
  addButtonEvents($(".legacy"));
};

const addButtonEvents = (container) => {
  if (container.dataset.listenerBound === "true") return;
  container.dataset.listenerBound = "true";

  container.addEventListener("click", (e) => {
    const actionEl = e.target.closest("[data-action]");
    console.log("click");
    console.log(actionEl);
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const keyword = actionEl.dataset.keyword;

    if (action === "add") {
      createUpdateCategoryModal(keyword);
    }
  });
};

const createUpdateCategoryModal = (keyword) => {
  // Obtener las categorías del estado
  const categories = categoryStore.getState();

  // Crear un HTML para el formulario
  let html = `
      <p>Actualizar categoría</p>
      <form id="updateCategoryForm">
          <label for="categorySelect">Selecciona una categoría</label>
          <select id="categorySelect">
              ${Object.keys(categories)
                .map((category) => {
                  return `<option value="${categories[category].name}">${categories[category].name}</option>`;
                })
                .join("")}
          </select>

          <label for="toAddKeyword">Nuevo nombre de categoría</label>
          <input type="text" id="toAddKeyword" placeholder="Nuevo nombre" value="${keyword}"/>
          <button type="submit">Actualizar categoría</button>
      </form>
  `;

  const eventHandlers = {
    // Maneja el envío del formulario
    x: (event) => {
      // event.preventDefault(); // Evitar que se recargue la página al enviar el formulario
      // // Obtener los valores del formulario
      // const categorySelect = document.getElementById("categorySelect");
      // const toAddKeyword = document.getElementById("toAddKeyword").value.trim();
      // const selectedCategory = categorySelect.value;
      // if (toAddKeyword && selectedCategory) {
      //     const oldCat = categoryStore.getState().filter((cat) => cat.name == categorySelect)
      //     // Llamar a la función para actualizar la categoría
      //     console.log(selectedCategory, {keywords: [...oldCat.keywords, ...keyword]})
      //     // updateCategory(selectedCategory, {keywords: [...oldCat.keywords, ...keyword]});
      //     // Cerrar el modal
      //     admUpdateCatModal.close();
      // } else {
      //     alert("Por favor, selecciona una categoría y escribe un nuevo nombre.");
      // }
    },
  };

  const updateCategoryHandler = (e) => {
    console.log({ e });
    e.preventDefault(); // Evitar que se recargue la página al enviar el formulario

    // // Obtener los valores del formulario
    const selectedCategory = document.getElementById("categorySelect").value;
    const toAddKeyword = document.getElementById("toAddKeyword").value.trim();

    if (toAddKeyword && selectedCategory) {
      const oldCat = categoryStore.getState().filter((cat) => cat.name == selectedCategory)[0];
      //     // console.log(oldCat)
      //     // oldCat.keywords.push(keyword)
      //     // Llamar a la función para actualizar la categoría
      // console.log(selectedCategory, {keywords: oldCat.keywords})
      updateCategory(selectedCategory, { keywords: [...oldCat.keywords, keyword] });
      // Cerrar el modal
      admUpdateCatModal.close();
    } else {
      alert("Por favor, selecciona una categoría y escribe un nuevo nombre.");
    }
  };
  // Crear el modal
  const admUpdateCatModal = new Modal("Actualizar Categoría", html, eventHandlers);

  // Crear el modal
  admUpdateCatModal.create();

  // Añadir el evento de submit al formulario
  document.getElementById("updateCategoryForm").addEventListener("submit", updateCategoryHandler);
};
