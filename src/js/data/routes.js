import { runLegacy } from "../pages/legacy.js";
import { runIndex } from "../pages/index.js";

export const routes  = {
    404: {"url": "pages/404.html", "js": function(){}},
    "/": {"url": "pages/index.html", "js": runIndex},
    "/legacy": {"url": "pages/legacy.html", "js": runLegacy}
}

