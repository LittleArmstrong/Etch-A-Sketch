import { $ } from "./toolbox.mjs";

const sketch_container = $("sketch-container");

//set resolution of panel

const panel_resolution = $("resolution");
const panel_resolution_copy = $("resolution-copy");
const min_resolution = 1;
const max_resolution = 100;
const sketch_size = 600 - 4; //size + border in px

var n_divs_row = 60; //defauöt
var n_divs_col = n_divs_row;
var n_divs = n_divs_row * n_divs_col;
var element_size = sketch_size / n_divs_row;

panel_resolution.value = n_divs_row;
panel_resolution_copy.textContent = n_divs_row;

set_resolution();

panel_resolution.addEventListener("change", (event) => {
   let value = Number(event.target.value);
   if (value !== NaN && value >= min_resolution && value <= max_resolution) {
      event.target.value = value;
      panel_resolution_copy.textContent = value;
      n_divs_row = value; //defauöt
      n_divs_col = n_divs_row;
      n_divs = n_divs_row * n_divs_col;
      element_size = sketch_size / n_divs_row;
      set_resolution();
      paint_div();
      event.target.blur();
   }
});

function set_resolution() {
   while (sketch_container.firstChild) {
      sketch_container.removeChild(sketch_container.lastChild);
   }
   for (let i = 0; i < n_divs; i++) {
      let div = document.createElement("div");
      div.style.width = element_size + "px";
      div.style.height = element_size + "px";
      console.log();
      sketch_container.appendChild(div);
   }
}

// painting
paint_div();

function paint_div(event) {
   document.querySelectorAll("#sketch-container>div").forEach((node) => {
      node.addEventListener("mouseenter", (event) => {
         event.target.style.backgroundColor = "black";
      });
   });
}

//clearing sketch
const clear_btn = $("clear-btn");
clear_btn.addEventListener("click", clear_sketch);

function clear_sketch(event) {
   let divs = Array.from(document.querySelectorAll("#sketch-container>div"));
   divs.forEach((node) => {
      node.style.backgroundColor = "white";
   });
}
