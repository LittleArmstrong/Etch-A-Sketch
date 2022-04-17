import SketchWidget from "./sketch_panel.mjs";
import { $, $all } from "./toolbox.mjs";

const clear_btn = $("#clear-btn");

clear_btn.addEventListener("click", SketchWidget.clear);

SketchWidget.init("#sketch-container");
