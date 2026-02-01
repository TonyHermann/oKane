import { runLegacy } from "../../ui/pages/legacy/legacy.js";
import { runIndex } from "../../ui/pages/home/index.js";

export const routes = {
  404: { url: "/src/ui/pages/404/404.html", js: function () {} },
  "/": { url: "/src/ui/pages/home/index.html", js: runIndex },
  "/legacy": { url: "/src/ui/pages/legacy/legacy.html", js: runLegacy },
};
