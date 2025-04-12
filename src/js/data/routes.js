import { runLegacy } from "../pages/legacy.js";
import { runIndex } from "../pages/index.js";

export const routes  = {
    404: {"url": "../src/pages/404.html", "js": function(){}},
    "/": {"url": "../src/pages/index.html", "js": runIndex},
    "/legacy": {"url": "../src/pages/legacy.html", "js": runLegacy}
}

