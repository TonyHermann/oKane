import './css/index.css';
import './js/router.js';
import { Modal } from "./js/components/Modal.js";
import { Assistant } from "./js/components/Assistant.js";
const assistant = new Assistant(); 

document.addEventListener("DOMContentLoaded", () => {
  run();
});

const initAssistant = (assistant) => {
  assistant.render($("body"));
  assistant.greet();
};

const run = () => {
  initAssistant(assistant);

  $("#admCat").addEventListener("click", () => {
    let html = 
    `
      <p>Administrador de categorías</p>
      <button id="showCategories">Mostrar categorías</button>
      <button id="addCategorie">Añadir una categoría</button>
    `;

    let admCatModal = new Modal ("Administrador de categorías", html);
    admCatModal.create();
  });
};