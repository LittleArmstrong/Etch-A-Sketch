import { $ } from "./toolbox.mjs";

const sketch_container = $("sketch-container");
const n_divs_row = 70;
const n_divs = n_divs_row * n_divs_row;
const sketch_size = 700;
const element_size = sketch_size / n_divs_row;

for (let i = 0; i < n_divs; i++) {
   let div = document.createElement("div");
   div.style.width = element_size + "px";
   div.style.height = element_size + "px";
   div.addEventListener("mouseenter", paint_div);
   sketch_container.appendChild(div);
}

function paint_div(event) {
   event.target.style.backgroundColor = "black";
}
