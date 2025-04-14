import { Modal } from "../components/Modal";

$("#admCat").addEventListener("click", () => {
    let html = 
    `
      <p>Administrador de categorías</p>
      <button id="showCategories">Mostrar categorías</button>
      <button id="addCategory">Añadir una categoría</button>
    `;

    let admCatModal = new Modal ("Administrador de categorías", html);
    admCatModal.create();
});

const categoryController = () => {
    $("#admCat").addEventListener("click", () => {
        let html = 
        `
        <p>Administrador de categorías</p>
        <button id="showCategories">Mostrar categorías</button>
        <button id="addCategory">Añadir una categoría</button>
        `;

        let admCatModal = new Modal ("Administrador de categorías", html);
        admCatModal.create();
    });
};


export { categoryController };