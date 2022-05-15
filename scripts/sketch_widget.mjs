import { $ } from "./toolbox.mjs";

const canvas_resolution = {
   width: {
      input: $("#cols"),
      validate: (num) => {
         return validate_resolution(num, [1, 100]);
      },
      default: 60,
   },
   height: {
      input: $("#rows"),
      validate: (num) => {
         return validate_resolution(num, [1, 100]);
      },
      default: 60,
   },
};

function set_resolution() {
   const new_resolution = get_new_resolution();
   const [status, result] = validate_resolution();
   switch (status) {
      case "ok":
         show_valid_resolution(canvas_resolution);
         break;
      case "error":
         show_invalid_resolution(canvas_resolution);
         return;
      default:
         throw new Error("Invalid status");
   }
   change_resolution(resolution, canvas);
}

function get_new_resolution() {
   const width = canvas_resolution.width.input.value;
   const height = canvas_resolution.height.input.value;
   return { height: height, width: width };
}

function get_resolution(inputs) {
   const resolution = {};
   Object.keys(inputs).forEach((key) => {
      let resolution_value = get_input_as_number(inputs[key].input);
      let [status, result] = inputs[key].validate(resolution_value);
      if (status === "error") return error(result);
      resolution[key] = result;
   });
   return ok(resolution);
}

function validate_resolution(num, range) {
   if (!Number.isInteger(num)) return error("Not an integer");
   return ok(num);
}

// nodes
const CANVAS_SELECTOR = "#sketch-container";
const canvas = $(CANVAS_SELECTOR);
const canvas_size = { width, height };
const CLEAR_BTN = $("#clear-btn");
const RESIZE_BTN = $("#resize-btn");

// validation
const CELLS_IN_ROW_LIMIT = [1, 100];
const CELLS_IN_COL_LIMIT = [1, 100];
const RED_BORDER_CLASS = "invalid-number";

let cells;
let paint_color = "black";
let is_painting = false;

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
      this.set_resolution();
   });

   // add clear function to clear button ("Clear")
   CLEAR_BTN.addEventListener("click", () => {
      this.clear();
   });
}

function set_color(color) {
   paint_color = color;
}

function clear() {
   cells.forEach((cell) => {
      cell.style.backgroundColor = "white";
   });
}

const SketchWidget = {
   init() {
      //get panel size
      Object.assign(canvas_size, get_canvas_size(canvas));

      //put default grid size in the input field
      show_resolution_value(canvas_resolution);

      //create grid
      set_resolution();

      //bind the events to the nodes
      bind_events();

      // return this object back
      return this;
   },
};

function ok(result) {
   return ["ok", result];
}

function error(reason) {
   return ["error", reason];
}

function get_input_as_number(input) {
   return Number(input.value);
}

function limit_number(num, min, max) {
   return Math.min(Math.max(num, min), max);
}

function create_grid(child_amount, child_size, parent) {
   for (let i = 0; i < child_amount; i++) {
      //set child size
      let child = document.createElement("div");
      child.style.width = child_size.width + "px";
      child.style.height = child_size.height + "px";

      //put child to parent
      parent.appendChild(child);
   }
   return parent;
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

function show_invalid_resolution(input_obj) {
   Object.keys(input_obj).forEach((key) => {
      input_obj[key].input.classList.add(RED_BORDER_CLASS);
   });
}

function show_valid_resolution(input_obj) {
   Object.keys(input_obj).forEach((key) => {
      input_obj[key].input.classList.remove(RED_BORDER_CLASS);
   });
}

function calc_cell_amount(cell_size) {
   return cell_size.width * cell_size.height;
}

function calcluate_cell_size(resolution, canvas) {
   const cell_size = { height, width };
   Object.keys(resolution).forEach((key) => {
      cell_size[key] = canvas[key] / resolution[key];
   });
   return cell_size;
}

function change_resolution(resolution, canvas) {
   remove_grid(canvas);
   const cell_size = calcluate_cell_size(resolution, canvas);
   const cell_amount = calc_cell_amount(cell_size);
   create_grid(cell_amount, cell_size, canvas);
}

function show_resolution_value(resolution) {
   Object.keys(resolution).forEach((key) => {
      resolution[key].input.value = resolution[key].default;
   });
}

function remove_grid(parent) {
   while (parent.firstChild) {
      parent.removeChild(parent.lastChild);
   }
}

function get_canvas_size(canvas) {
   const border_width = canvas.style.borderWidth;
   const canvas_size = { height, width };
   canvas_size.height = canvas.clientHeight - 2 * border_width;
   canvas_size.width = canvas.clientWidth - 2 * border_width;
   return canvas_size;
}

export default SketchWidget;
