import './css/index.css';
import './js/router.js';
import { Assistant } from "./js/components/Assistant.js";
const assistant = new Assistant(); 

document.addEventListener("DOMContentLoaded", () => {
  run()
});

const initAssistant = (assistant) => {
  assistant.render($("body"))
  assistant.greet()
}

const run = () => {
  initAssistant(assistant)
  console.log("Testeando!")
}