import { $ } from "./toolbox.mjs";

const canvas_node = $("#sketch-container");
const resolution_IO = { width: $("#cols"), height: $("#rows") };
const change_resolution_btn = $("#resize-btn");
const invalid_resolution_input_css_class = "invalid-number";
const resolution_settings = {
   limits: { width: [1, 100], height: [1, 100] },
   min_size: { width: 1, height: 1 },
   default: { width: 60, height: 60 },
};
const paint_color = "black";
const clear_btn = $("#clear-btn");
const clear_color = "white";

let is_painting = false;

const SketchWidget = {
   init() {
      bind_events();
      set_to_border_box(canvas_node);
      write_to_resolution_field(resolution_settings.default);
      change_resolution();
      return this;
   },
};

function bind_events() {
   // allow painting only if mouse button is being pressed down
   canvas_node.addEventListener("mousedown", () => {
      is_painting = true;
   });
   canvas_node.addEventListener("mouseup", () => {
      is_painting = false;
   });

   // add reize function to resize button ("Apply")
   change_resolution_btn.addEventListener("click", () => {
      change_resolution();
   });

   // add clear function to clear button ("Clear")
   clear_btn.addEventListener("click", () => {
      clear();
   });
}

function set_to_border_box(node) {
   node.setAttribute("box-sizing", "border-box");
}

function write_to_resolution_field({ width, height }) {
   write_to_field(height, resolution_IO.height);
   write_to_field(width, resolution_IO.width);
}

function write_to_field(value, field) {
   return (field.value = value);
}

function change_resolution() {
   const canvas_size = get_true_node_size(canvas_node);
   const [canvas_size_status, canvas_size_result] = validate_canvas_size(canvas_size);
   switch (canvas_size_status) {
      case "ok":
         break;
      case "error":
         return error(canvas_size_result);
      default:
         throw new Error("Invalid case");
   }

   const resolution = read_from_resolution_field();
   const [resolution_status, resolution_result] = validate_resolution(resolution);
   switch (resolution_status) {
      case "ok":
         show_valid_resolution_input();
         break;
      case "error":
         show_invalid_resolution_input();
         return error(resolution_result);
      default:
         throw new Error("Invalid case");
   }
   const cell_amount = calc_cell_amount(resolution_result);
   const cell_size = calc_cell_size(resolution_result, canvas_size);
   const grid = create_grid(cell_amount, cell_size);
   set_resolution(grid);
   add_paint_function_to_canvas();
}

function get_true_node_size(node) {
   const height = node.clientHeight - 2 * node.style.borderWidth;
   const width = node.clientWidth - 2 * node.style.borderWidth;
   return { height: height, width: width };
}

function validate_canvas_size({ width, height }) {
   const min_canvas = calc_min_canvas_size(
      resolution_settings.min_size,
      resolution_settings.limits
   );
   if (width < min_canvas.width || height < min_canvas.height) return error("Invalid size");
   return ok({ width: width, height: height });
}

function calc_min_canvas_size(min_cell_size, resolution_limits) {
   const min_canvas = {};
   min_canvas.width = min_cell_size.width * resolution_limits.width[1];
   min_canvas.height = min_cell_size.height * resolution_limits.height[1];
   return min_canvas;
}

function read_from_resolution_field() {
   const width = read_from_field_as_number(resolution_IO.width);
   const height = read_from_field_as_number(resolution_IO.height);
   return { width: width, height: height };
}

function read_from_field_as_number(field) {
   return Number(field.value);
}

function numbers_are_integer(numbers) {
   Object.values(numbers).forEach((number) => {
      if (!Number.isInteger(number)) return false;
   });
   return true;
}

function numbers_are_in_range(numbers, limits) {
   Object.entries(numbers).forEach(([key, value]) => {
      if (value < limits[key][0] || value > limits[key][1]) return false;
   });
   return true;
}

function validate_resolution(resolution) {
   if (
      !numbers_are_integer(resolution) ||
      !numbers_are_in_range(resolution, resolution_settings.limits)
   )
      return error("Invalid resolution");
   return ok(resolution);
}

function show_valid_resolution_input() {
   resolution_IO.width.classList.remove(invalid_resolution_input_css_class);
   resolution_IO.height.classList.remove(invalid_resolution_input_css_class);
}
function show_invalid_resolution_input() {
   resolution_IO.width.classList.add(invalid_resolution_input_css_class);
   resolution_IO.height.classList.add(invalid_resolution_input_css_class);
}

function calc_cell_amount({ width, height }) {
   return width * height;
}

function calc_cell_size(resolution, canvas_size) {
   const cell_size = {};
   cell_size.width = canvas_size.width / resolution.width;
   cell_size.height = canvas_size.height / resolution.height;
   return cell_size;
}

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

function set_resolution(grid) {
   canvas_node.replaceChildren(...grid.children);
}

function add_paint_function_to_canvas() {
   Array.from(canvas_node.children).forEach((cell) => {
      cell.addEventListener("mouseover", (event) => {
         if (is_painting) event.target.style.backgroundColor = paint_color;
      });
   });
}

function clear() {
   Array.from(canvas_node.children).forEach((cell) => {
      cell.style.backgroundColor = clear_color;
   });
}

function ok(result) {
   return ["ok", result];
}

function error(reason) {
   return ["error", reason];
}

export default SketchWidget;
