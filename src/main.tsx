import "./ui/styles/index.css";
import "./js/router.js";
import { assistant } from "./ui/components/Assistant.ts";
import { categoryController } from "./js/controllers/categoryController.js";

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
