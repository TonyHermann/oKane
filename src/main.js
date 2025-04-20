import './css/index.css';
import './js/router.js';
import { assistant } from "./js/components/Assistant.js";
import { categoryController } from './js/controllers/categoryController.js';
import { categoryStore } from './js/store/categoryStore.js';
import { categories } from "../public/data/categories.js"
import { addCategory } from './js/services/categoryService.js';

document.addEventListener("DOMContentLoaded", () => {
  run();
});

const initAssistant = (assistant) => {
  assistant.render($("body"));
  assistant.greet();
};

const addCatsMassivelyButton = () => {
  const btn = `<button>addCatsMassivelyButton</button>`
  var div = document.createElement("div")
  div.innerHTML = btn
  div.addEventListener("click", () => {
    categoryStore.clearAndSet([]);
    categories.forEach(cat => {
      addCategory(cat);
    });
  })
  $(".nav_left").appendChild(div);

}

const run = async () => {
  initAssistant(assistant);
  categoryController();
  // addCatsMassivelyButton();
};
