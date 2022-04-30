import { $, $all, is_color } from "./toolbox.mjs";

const GRID_SIZE_RANGE = { MIN: 1, MAX: 100 };
const PANEL_SELECTOR = "#sketch-container";
const PANEL = $(PANEL_SELECTOR);
const CLEAR_BTN = $("#clear-btn");

let panel_width, panel_height;
let cells, n_cells;
let cell_height, cell_width;
let paint_color = "black";
let grid_size = { n_rows: 60, n_cols: 60 };

const SketchWidget = {
   init() {
      //get panel size
      let border_width = PANEL.style.borderWidth;
      panel_width = PANEL.clientWidth - 2 * border_width; // subtract cause of border-box
      panel_height = PANEL.clientHeight - 2 * border_width; // see above

      //calculate cell size
      n_cells = grid_size.n_rows * grid_size.n_cols;
      cell_height = panel_height / grid_size.n_rows;
      cell_width = panel_width / grid_size.n_cols;

      //create grid
      this.resize_grid();

      //bind all necessary events to the needed nodes
      this.bind_events();

      // return this object back
      return this;
   },

   bind_events() {
      // add clear funtion to clear button
      CLEAR_BTN.addEventListener("click", () => {
         this.clear();
      });
   },

   resize_grid(new_grid_size) {
      // if new grid size is given, check if valid and overwrite old value
      if (typeof new_grid_size !== "undefined") {
         for (let value in Object.Values(new_grid_size)) {
            if (value < GRID_SIZE_RANGE.MIN || value > GRID_SIZE_RANGE.MAX) return;
         }
         Object.assign(grid_size, new_grid_size);
      }

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

         //allow painting
         cell.addEventListener("mouseover", (event) => {
            event.target.style.backgroundColor = paint_color;
         });

         //put cell in panel
         PANEL.appendChild(cell);
      }

      //save reference to all cells
      cells = $all(PANEL_SELECTOR + ">div");
   },

   set_color(color) {
      if (is_color(color)) paint_color = color;
   },

   clear() {
      cells.forEach((cell) => {
         cell.style.backgroundColor = "white";
      });
   },
};

export default SketchWidget;
