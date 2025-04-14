import './css/index.css';
import './js/router.js';
import { Assistant } from "./js/components/Assistant.js";
import { categoryController } from './js/controllers/categoryController.js';
const assistant = new Assistant(); 

document.addEventListener("DOMContentLoaded", () => {
  run();
});

const initAssistant = (assistant) => {
  assistant.render($("body"));
  assistant.greet();
};

const run = async () => {
  initAssistant(assistant);
  categoryController();
};