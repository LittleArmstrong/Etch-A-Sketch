import { $ } from "./toolbox.mjs";

const canvas = {
   node: "#sketch-container",
   set_to_border_box() {
      this.node.setAttribute("box-sizing", "border-box");
   },
   get size() {
      const height = this.node.clientHeight - 2 * this.node.style.borderWidth;
      const width = this.node.clientWidth - 2 * this.node.style.borderWidth;
      return { height: height, width: width };
   },
   validate_size({ width, height }) {
      const min_height = this.resolution.min_size.height * this.resolution.limit.height[1];
      const min_width = this.resolution.min_size.width * this.resolution.limit.width[1];
      if (height < min_height || width < min_width) return error("Invalid size");
      return ok({ width: width, height: height });
   },
   resolution: {
      IO: { width: $("#cols"), height: $("#rows") },
      get value() {
         const width = Number(this.IO.width.value);
         const height = Number(this.IO.height.value);
         return { width: width, height: height };
      },
      validate({ width, height }) {
         if (!Number.isInteger(width) || !Number.isInteger(height)) return error("Invalid type");
         const width_is_in_range = width >= this.limit.width[0] && width <= this.limit.width[1];
         const height_is_in_range =
            height >= this.limit.height[0] && height <= this.limit.height[1];
         if (!width_is_in_range || !height_is_in_range) return error("Value out of range");
         return ok({ width: width, height: height });
      },
      set({ width, height }) {
         this.IO.height.value = height;
         this.IO.width.value = width;
      },
      set_default() {
         this.set(this.default);
      },
      limit: { width: [1, 100], height: [1, 100] },
      min_size: { width: 1, height: 1 },
      default: { width: 60, height: 60 },
   },
   change_resolution(grid) {
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
      canvas.resolution.set_default();
      //console.log(canvas.resolution.value);

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
