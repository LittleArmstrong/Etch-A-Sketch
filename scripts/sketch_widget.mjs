import { $, $all } from "./toolbox.mjs";

const GRID_SIZE_RANGE = [1, 100];
const PANEL_SELECTOR = "#sketch-container";
const PANEL = $(PANEL_SELECTOR);
const CLEAR_BTN = $("#clear-btn");
const IO_GRID_ROWS = $("#rows");
const IO_GRID_COLS = $("#cols");
const RESIZE_BTN = $("#resize-btn");

let panel_width, panel_height;
let cells, n_cells;
let cell_height, cell_width;
let paint_color = "black";
let is_painting = false;
let grid_size = [60, 60]; //rows, cols; default value arbitrarily chosen

const SketchWidget = {
   init() {
      //get panel size
      let border_width = PANEL.style.borderWidth;
      panel_width = PANEL.clientWidth - 2 * border_width; // subtract cause of border-box
      panel_height = PANEL.clientHeight - 2 * border_width; // see above

      //put default grid size in the input field
      IO_GRID_ROWS.value = grid_size[0];
      IO_GRID_COLS.value = grid_size[1];

      //create grid
      this.resize_grid();

      //bind the events to the nodes
      this.bind_events();

      // return this object back
      return this;
   },

   bind_events() {
      // allow painting only if mouse button is being pressed down
      PANEL.addEventListener("mousedown", () => {
         is_painting = true;
      });
      PANEL.addEventListener("mouseup", () => {
         is_painting = false;
      });

      // add reize function to resize button ("Apply")
      RESIZE_BTN.addEventListener("click", () => {
         this.resize_grid();
      });

      // add clear function to clear button ("Clear")
      CLEAR_BTN.addEventListener("click", () => {
         this.clear();
      });
   },

   resize_grid() {
      // get new grid size
      let new_grid_size = [Number(IO_GRID_ROWS.value), Number(IO_GRID_COLS.value)];

      // check if grid size valid or bail
      let is_invalid_grid_size = new_grid_size.some((value) => {
         return typeof value !== "number" || isNaN(value);
      });

      if (is_invalid_grid_size) {
         //color input border red if invalid
         IO_GRID_ROWS.classList.add("invalid-input");
         IO_GRID_COLS.classList.add("invalid-input");
         return;
      } else {
         //remove red border if there and valid input
         IO_GRID_ROWS.classList.remove("invalid-input");
         IO_GRID_COLS.classList.remove("invalid-input");
      }

      // limit values to the allowed range and set grid size
      grid_size = new_grid_size.map((num) => {
         return Math.min(Math.max(num, GRID_SIZE_RANGE[0]), GRID_SIZE_RANGE[1]);
      });

      //calculate cell size for new grid
      n_cells = grid_size[0] * grid_size[1];
      cell_height = panel_height / grid_size[0];
      cell_width = panel_width / grid_size[1];

      //remove previous grid
      while (PANEL.firstChild) {
         PANEL.removeChild(PANEL.lastChild);
      }

      //create new one
      for (let i = 0; i < n_cells; i++) {
         //set cell size
         let cell = document.createElement("div");
         cell.style.width = cell_width + "px";
         cell.style.height = cell_height + "px";

         //allow painting only if mouse button is pressed and over cell
         cell.addEventListener("mouseover", (event) => {
            if (is_painting) event.target.style.backgroundColor = paint_color;
         });

         //put cell in panel
         PANEL.appendChild(cell);
      }

      //save reference to all cells
      cells = $all(PANEL_SELECTOR + ">div");

      //put actual grid size in the input field
      IO_GRID_ROWS.value = grid_size[0];
      IO_GRID_COLS.value = grid_size[1];
   },

   set_color(color) {
      paint_color = color;
   },

   clear() {
      cells.forEach((cell) => {
         cell.style.backgroundColor = "white";
      });
   },
};

export default SketchWidget;
