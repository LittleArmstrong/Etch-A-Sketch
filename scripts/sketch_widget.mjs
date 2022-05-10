import { $, $all } from "./toolbox.mjs";

// nodes
const CANVAS_SELECTOR = "#sketch-container";
const CANVAS = $(CANVAS_SELECTOR);
const CLEAR_BTN = $("#clear-btn");
const CELLS_IN_ROW_INPUT = $("#rows");
const CELLS_IN_COL_INPUT = $("#cols");
const RESIZE_BTN = $("#resize-btn");

// validation
const CELLS_IN_ROW_LIMIT = [1, 100];
const CELLS_IN_COL_LIMIT = [1, 100];
const INVALID_NUMBER_CSS_CLASS = "invalid-number";

let canvas_width, canvas_height;
let cells, n_cells;
let cell_height, cell_width;
let paint_color = "black";
let is_painting = false;
let cells_in_row = 60;
let cells_in_col = 60;
let grid_size = [60, 60]; //rows, cols; default value arbitrarily chosen

function get_input_as_number(input_node) {
   return Number(input_node.value);
}

function get_cells_in_row() {
   return get_input_as_number(CELLS_IN_ROW_INPUT);
}

function get_cells_in_col() {
   return get_input_as_number(CELLS_IN_COL_INPUT);
}

function is_valid_number(value) {
   return typeof value === "number" && !isNaN(value);
}

function limit_number(number, min, max) {
   return Math.min(Math.max(num, min), max);
}

function calc_cell_amount(cells_in_row, cells_in_col) {
   return cells_in_row * cells_in_col;
}

const SketchWidget = {
   init() {
      //get panel size
      let border_width = CANVAS.style.borderWidth;
      canvas_width = CANVAS.clientWidth - 2 * border_width; // subtract cause of border-box
      canvas_height = CANVAS.clientHeight - 2 * border_width; // see above

      //put default grid size in the input field
      CELLS_IN_ROW_INPUT.value = grid_size[0];
      CELLS_IN_COL_INPUT.value = grid_size[1];

      //create grid
      this.resize_grid();

      //bind the events to the nodes
      this.bind_events();

      // return this object back
      return this;
   },

   bind_events() {
      // allow painting only if mouse button is being pressed down
      CANVAS.addEventListener("mousedown", () => {
         is_painting = true;
      });
      CANVAS.addEventListener("mouseup", () => {
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
      let new_cells_in_col = get_cells_in_col();
      let new_cells_in_row = get_cells_in_row();

      // check if grid size is valid or bail
      if (!is_valid_number(new_cells_in_col)) {
         //use fsm for new state "Error"?
         CELLS_IN_COL_INPUT.classList.add(INVALID_NUMBER_CSS_CLASS);
         return;
      } else {
         CELLS_IN_COL_INPUT.classList.remove(INVALID_NUMBER_CSS_CLASS);
      }

      if (!is_valid_number(new_cells_in_row)) {
         //use fsm for new state "Error"?
         CELLS_IN_ROW_INPUT.classList.add(INVALID_NUMBER_CSS_CLASS);
         return;
      } else {
         CELLS_IN_ROW_INPUT.classList.remove(INVALID_NUMBER_CSS_CLASS);
      }

      // limit values to the allowed range
      new_cells_in_col = limit_number(
         new_cells_in_col,
         CELLS_IN_COL_LIMIT[0],
         CELLS_IN_COL_LIMIT[1]
      );
      new_cells_in_row = limit_number(
         new_cells_in_row,
         CELLS_IN_ROW_LIMIT[0],
         CELLS_IN_ROW_LIMIT[1]
      );

      //calculate new cell size
      let new_cell_height = canvas_height / new_cells_in_col;
      let new_cell_width = canvas_width / new_cells_in_row;

      //remove previous grid
      while (CANVAS.firstChild) {
         CANVAS.removeChild(CANVAS.lastChild);
      }

      //calculate new cell amount
      let new_cell_amount = calc_cell_amount(new_cells_in_row, new_cells_in_col);

      //create new one
      for (let i = 0; i < new_cell_amount; i++) {
         //set cell size
         let cell = document.createElement("div");
         cell.style.width = cell_width + "px";
         cell.style.height = cell_height + "px";

         //allow painting only if mouse button is pressed and over cell
         cell.addEventListener("mouseover", (event) => {
            if (is_painting) event.target.style.backgroundColor = paint_color;
         });

         //put cell in panel
         CANVAS.appendChild(cell);
      }

      //save reference to all cells
      cells = $all(CANVAS_SELECTOR + ">div");

      //put actual grid size in the input field
      CELLS_IN_ROW_INPUT.value = grid_size[0];
      CELLS_IN_COL_INPUT.value = grid_size[1];
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
