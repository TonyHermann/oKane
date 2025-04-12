export function getNombresUnicos(arrTransSinCat) {
    console.log(arrTransSinCat);
    let nombresUnicos = [];
    let catUni = arrTransSinCat.filter((transaccion) => {
      let valido = false;
      if (!nombresUnicos.includes(transaccion.description)) {
        valido = true;
        nombresUnicos.push(transaccion.description);
      }
      return valido;
    });
    console.log(nombresUnicos, catUni);
}