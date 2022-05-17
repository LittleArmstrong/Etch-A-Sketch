import { $ } from "./toolbox.mjs";

const canvas = {
   node: "#sketch-container",
   get height() {
      return this.node.clientHeight - 2 * this.node.style.borderWidth;
   },
   get width() {
      return this.node.clientWidth - 2 * this.node.style.borderWidth;
   },
   set_to_border_box() {
      this.node.setAttribute("box-sizing", "border-box");
   },
   validate_height(height) {
      if (height / this.cells_in_height.limit[1] < this.cells_in_height.min_size)
         return error("Invalid size");
      return ok(size);
   },
   validate_width(width) {
      if (width / this.cells_in_width.limit[1] < this.cells_in_width.min_size)
         return error("Invalid size");
      return ok(size);
   },
   get size() {
      return { height: this.height, width: this.width };
   },
   validate_size({ width, height }) {
      const [status_width, result_width] = this.validate_width(width);
      const [status_height, result_height] = this.validate_height(height);
      if (status_height == "ok" && status_width == "ok")
         return ok({ width: result_width, height: result_height });
      else return error("Invalid size");
   },
   cells_in_width: {
      IO: $("#cols"),
      get as_number() {
         return Number(this.IO.value);
      },
      validate(amount) {
         if (!Number.isInteger(amount)) return error("Not an integer");
         if (amount < this.limit[0] || amount > this.limit[1]) return error("Not in range");
         return ok(amount);
      },
      set(amount) {
         let [status, result] = this.validate(amount);
         switch (status) {
            case "ok":
               this.IO.value = result;
               return [status, result];
            case "error":
               return [status, result];
            default:
               throw new Error("Invalid case");
         }
      },
      set_default() {
         this.set(this.default);
      },
      min_size: 1,
      limit: [1, 100],
      default: 60,
   },
   cells_in_height: {
      IO: $("#rows"),
      get as_number() {
         return Number(this.IO.value);
      },
      validate(amount) {
         if (!Number.isInteger(amount)) return error("Not an integer");
         if (amount < this.limit[0] || amount > this.limit[1]) return error("Not in range");
         return ok(amount);
      },
      set(amount) {
         let [status, result] = this.validate(amount);
         switch (status) {
            case "ok":
               this.IO.value = result;
               return [status, result];
            case "error":
               return [status, result];
            default:
               throw new Error("Invalid case");
         }
      },
      set_default() {
         this.set(this.default);
      },
      min_size: 1,
      limit: [1, 100],
      default: 60,
   },
   get resolution() {
      return { width: this.cells_in_width.as_number, height: this.cells_in_height.as_number };
   },
   validate_resolution({ width, height }) {
      const [status_width, result_width] = this.cells_in_width.validate(width);
      const [status_height, result_height] = this.cells_in_height.validate(height);
      if (status_height == "ok" && status_width == "ok")
         return ok({ width: result_width, height: result_height });
      else return error("Invalid size");
   },
   set_resolution(grid) {
      this.node.replaceChildren(...grid.children);
   },
};
const CLEAR_BTN = $("#clear-btn");
const RESIZE_BTN = $("#resize-btn");

// validation

const RED_BORDER_CLASS = "invalid-number";

let paint_color = "black";
let is_painting = false;

const SketchWidget = {
   init() {
      //put default grid size in the input field
      canvas.cells_in_height.set_default();
      canvas.cells_in_width.set_default();

      // //create grid
      // set_resolution();

      // //bind the events to the nodes
      // bind_events();

      // // return this object back
      // return this;
   },
};

function create_grid(cell_amount, cell_size) {
   const grid = document.createElement("div");
   for (let i = 0; i < cell_amount; i++) {
      //set cell size
      let cell = document.createElement("div");
      cell.style.width = cell_size.width + "px";
      cell.style.height = cell_size.height + "px";
      //put cell to parent
      grid.appendChild(cell);
   }
   return grid;
}

function show_default_resolution() {
   Object.keys(canvas_resolution).forEach((key) => {
      canvas_resolution[key].input.value = canvas_resolution[key].default;
   });
}

function set_resolution() {
   const new_resolution = get_new_resolution();
   const [status, result] = validate_resolution(new_resolution);
   switch (status) {
      case "ok":
         show_valid_resolution();
         change_resolution(result);
         break;
      case "error":
         show_invalid_resolution();
         return;
      default:
         throw new Error("Invalid status");
   }
}

function bind_events() {
   // allow painting only if mouse button is being pressed down
   canvas.addEventListener("mousedown", () => {
      is_painting = true;
   });
   canvas.addEventListener("mouseup", () => {
      is_painting = false;
   });

   // add reize function to resize button ("Apply")
   RESIZE_BTN.addEventListener("click", () => {
      set_resolution();
   });

   // add clear function to clear button ("Clear")
   CLEAR_BTN.addEventListener("click", () => {
      clear();
   });
}

function get_canvas_size(canvas) {
   const border_width = canvas.style.borderWidth;
   const canvas_size = {};
   canvas_size.height = canvas.clientHeight - 2 * border_width;
   canvas_size.width = canvas.clientWidth - 2 * border_width;
   return canvas_size;
}

function get_new_resolution() {
   const width = canvas_resolution.width.input.value;
   const height = canvas_resolution.height.input.value;
   return { height: height, width: width };
}

function show_valid_resolution() {
   Object.keys(canvas_resolution).forEach((key) => {
      canvas_resolution[key].input.classList.remove(RED_BORDER_CLASS);
   });
}

function show_invalid_resolution() {
   Object.keys(canvas_resolution).forEach((key) => {
      canvas_resolution[key].input.classList.add(RED_BORDER_CLASS);
   });
}

function change_resolution(resolution) {
   remove_grid(canvas);
   const cell_size = calc_cell_size(resolution, canvas);
   const cell_amount = calc_cell_amount(cell_size);
   create_grid(cell_amount, cell_size, canvas);
}

function remove_grid(parent) {
   while (parent.firstChild) {
      parent.removeChild(parent.lastChild);
   }
}

function calc_cell_size(resolution, canvas_size) {
   const cell_size = { height, width };
   Object.keys(resolution).forEach((key) => {
      cell_size[key] = canvas[key] / resolution[key];
   });
   return cell_size;
}

function calc_cell_amount(cell_size) {
   return cell_size.width * cell_size.height;
}

function clear() {
   cells.forEach((cell) => {
      cell.style.backgroundColor = "white";
   });
}

function ok(result) {
   return ["ok", result];
}

function error(reason) {
   return ["error", reason];
}

function get_input_as_number(input) {
   return Number(input.value);
}

function adjust_number_to_range(num, [min, max]) {
   return Math.min(Math.max(num, min), max);
}

function show_adjusted_resolution(resolution) {
   Object.keys(canvas_resolution).forEach((key) => {
      canvas_resolution[key].input.value = resolution[key].default;
   });
}

function add_click_painting_to_canvas(parent) {
   let settings = {
      type: "mouseover",
      func: (event) => {
         if (is_painting) event.target.style.backgroundColor = paint_color;
      },
   };
   add_event_to_children(parent, settings);
}

function add_event_to_children(parent, { type, func }) {
   Array.from(parent.children).forEach((child) => {
      child.addEventListener(type, (event) => {
         func(event);
      });
   });
}

function set_color(color) {
   paint_color = color;
}

export default SketchWidget;
