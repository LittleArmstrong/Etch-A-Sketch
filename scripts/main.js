import SketchWidget from "./sketch_widget.mjs";
import { $, $all } from "./toolbox.mjs";

const sketch_widget = new SketchWidget("#sketch-container");
$("#clear-btn").addEventListener("click", () => {
   sketch_widget.clear();
});

// const sketch_container = $("#sketch-container");

// //set resolution of panel

// const panel_resolution = $("#resolution");

// panel_resolution.value = n_divs_row;
// panel_resolution_copy.textContent = n_divs_row;

// panel_resolution.addEventListener("change", (event) => {
//    let value = Number(event.target.value);
//    if (value !== NaN && value >= min_resolution && value <= max_resolution) {
//       event.target.value = value;
//       panel_resolution_copy.textContent = value;
//       n_divs_row = value; //defauöt
//       n_divs_col = n_divs_row;
//       n_divs = n_divs_row * n_divs_col;
//       element_size = sketch_size / n_divs_row;
//       set_resolution();
//       set_color();
//       event.target.blur();
//    }
// });
