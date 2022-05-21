import { $ } from "./toolbox.mjs";

const canvas_node = $("#sketch-container");
const resolution_width = {
   IO: $("#cols"),
   limit: [1, 100],
   min_size: 1,
   default: 60,
};
const resolution_height = {
   IO: $("#rows"),
   limit: [1, 100],
   min_size: 1,
   default: 60,
};
/**
 * Start widget:
 * - Bind events
 * - Set canvas to border-box
 * - Write the default resolution values into the field
 * - Create resolution grid
 * - Allow painting
 */
export function init_SketchWidget() {
   bind_events();
   set_to_border_box(canvas_node);
   write_to_resolution_field(resolution_width.default, resolution_height.default);
   change_resolution();
}

const resolution_btn = $("#resize-btn");
const clear_btn = $("#clear-btn");

let is_painting = false;
/**
 * Add all necessary events to the specified nodes.
 * - Clicking on canvas for painting
 * - Clicking on clear button to clear canvas
 * - Clicking on resolution button to change resolution
 */
function bind_events() {
   // allow painting only if mouse button is being pressed down
   canvas_node.addEventListener("mousedown", () => {
      is_painting = true;
   });
   canvas_node.addEventListener("mouseup", () => {
      is_painting = false;
   });

   // add reize function to resize button ("Apply")
   resolution_btn.addEventListener("click", () => {
      change_resolution();
   });

   // add clear function to clear button ("Clear")
   clear_btn.addEventListener("click", () => {
      clear();
   });
}

/**
 * Set the content-type of the element to "border-box"
 *
 * @param {HTMLElement} node Some HTMLElement
 */

function set_to_border_box(node) {
   node.setAttribute("box-sizing", "border-box");
}

/**
 * Write the values to the fields for the resolution change.
 *
 * @param {{width: (number|string), height: (number|string)}} resolution Resolution width and height in cells
 */

function write_to_resolution_field(width, height) {
   write_to_field(width, resolution_width.IO);
   write_to_field(height, resolution_height.IO);
}

/**
 * Write the value to the passed input element.
 *
 * @param {(string|number)} value   Value to be written
 * @param {HTMLElement} field       An input element
 */
function write_to_field(value, field) {
   field.value = value;
}

/**
 * Changes the resolution of the canvas to the value set in the input, if valid.
 * Basically replaces the div children of the canvas node (div) with the specified amount
 * of divs (cells) in the input with the cell size calculated depending on the canvas size
 * and chosen resolution (amount of cells)
 *
 * @returns {["ok"|"error, null|string]} Either "ok" with null or "error" with a message
 */

function change_resolution() {
   // get the size of the canvas and check if valid
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

   // read the input values for the new resolution and check if they are valid
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
   // calcualte the needed amount of cells, their size and create a resolution grid (parent div) out of div elements (children)
   const cell_amount = calc_cell_amount(resolution_result);

   const cell_size = calc_cell_size(resolution_result, canvas_size);

   const grid = create_grid(cell_amount, cell_size);
   // replace the children of the canvas node with the children of newly created grid
   set_resolution(grid);
   // add the ability to paint the canvas through clicking, hovering and by changing the background color
   add_paint_function_to_canvas();
   return ok(null);
}

/**
 * Get the size of a node excluding the border (border-box).
 *
 * @param {HTMLElement} node                    The element we want the size of
 * @returns {{height: number, width: number}}   Available size of the canvas (without border)
 */

function get_true_node_size(node) {
   const width = node.clientWidth - 2 * node.style.borderWidth;
   const height = node.clientHeight - 2 * node.style.borderWidth;
   return { width: width, height: height };
}

/**
 * Check if the canvas node is above the minimum allowed value
 *
 * @param {{width:number, height: number}} canvas_size               Canvas size in px
 * @returns {["ok"|"error",{width: width, height: height}|string]}  "ok" with canvas size or "error" with message
 */
function validate_canvas_size({ width, height }) {
   const { min_width, min_height } = calc_min_canvas_size();
   if (width < min_width || height < min_height) return error("Invalid size");
   return ok({ width: width, height: height });
}

/**
 * Calculate the smallest allowed width and height of the canvas based on the maximum allowed amount of cells
 * and the lowest allowed cell width and height
 *
 * @returns {{width: number, height: number}} Object with the smallest allowed width and height of the canvas in px
 */

function calc_min_canvas_size() {
   const width = calc_min_dim(width_settings.min_size, width_settings.limit[1]);
   const height = calc_min_dim(height_settings.min_size, height_settings.limit[1]);
   return { min_width: width, min_height: height };
}

/**
 * Calculate the smallest size needed for the specified values.
 *
 * @param {number} min_value Smallest allowed value of the unit
 * @param {number} max_amount Highest allowed amount allowed of the value
 * @returns {number} Smallest needed size to allow the specified values
 */

function calc_min_dim(min_value, max_amount) {
   return min_value * max_amount;
}

/**
 * Read the values of the resolution input fields and convert them to numbers.
 *
 * @returns {{width: number, height: number}} Resolution in cells
 */
function read_from_resolution_field() {
   const width = read_from_field_as_number(resolution_width.IO);
   const height = read_from_field_as_number(resolution_height.IO);
   return { width: width, height: height };
}

/**
 * Read the value of an input type element
 *
 * @param {HTMLElement} field    An input type element
 * @returns {number}             The value converted into a number
 */

function read_from_field_as_number(field) {
   return Number(field.value);
}

/**
 * Check if the resolution values are integers and in the allowed range
 *
 * @param {{width: number, height: number}} resolution  Contains the width and height of the canvas resolution in px
 * @returns {["ok"|"error", object|string]}             "ok" with resolution or "error" with message
 */
function validate_resolution({ width, height }) {
   if (!Number.isInteger(width) || !Number.isInteger(height)) return error("Not an integer");
   if (width < resolution_width.limit[0] || width > resolution_width.limit[1])
      return error("Resolution width not in range");
   if (height < resolution_height.limit[0] || height > resolution_height.limit[1])
      return error("Resolution height not in range");
   return ok({ width, height });
}

const invalid_resolution_input_css_class = "invalid-number";
/**
 * Remove the CSS class that adds red borders from the resolution input field
 */
function show_valid_resolution_input() {
   resolution_width.IO.classList.remove(invalid_resolution_input_css_class);
   resolution_height.IO.classList.remove(invalid_resolution_input_css_class);
}

/**
 * Add the CSS class that adds red borders to the resolution input field
 */
function show_invalid_resolution_input() {
   resolution_width.IO.classList.add(invalid_resolution_input_css_class);
   resolution_height.IO.classList.add(invalid_resolution_input_css_class);
}

/**
 * Multiply the cell amount in the width and height for the total amount
 *
 * @param {{width: number, height: number}} resolution   Resolution
 * @returns {number}                                     The total cell amount
 */
function calc_cell_amount({ width, height }) {
   return width * height;
}

/**
 * Calculate the width and height of the cells for the given resolution and canvas size
 *
 * @param {{width: number, height: number}} resolution   Resolution size in cells
 * @param {{width: number, height: number}} canvas_size  Canvas size in px
 * @returns {{width: number, height: number}}            Returns cell size in px
 */
function calc_cell_size(resolution, canvas_size) {
   const width = canvas_size.width / resolution.width;
   const height = canvas_size.height / resolution.height;
   return { width: width, height: height };
}

/**
 * Create a div with the specified amount of div children in a specified size.
 *
 * @param {number} cell_amount                        Amount of div children (cells of the grid)
 * @param {{width: number, height: number}} cell_size Size of the div children (size of the grid cells)
 * @returns {HTMLElement}                             div element with div children
 */
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

/**
 * Replace the children of the canvas node with the provided ones
 *
 * @param {HTMLElement} grid  div with child elements
 */
function set_resolution(grid) {
   canvas_node.replaceChildren(...grid.children);
}

const paint_color = "black";
/**
 * Allow the painting on click over the canvas
 */
function add_paint_function_to_canvas() {
   Array.from(canvas_node.children).forEach((cell) => {
      cell.addEventListener("mouseover", (event) => {
         if (is_painting) event.target.style.backgroundColor = paint_color;
      });
   });
}

const clear_color = "white";
/**
 * Fill the canvas with the specified color for clearing
 */
function clear() {
   Array.from(canvas_node.children).forEach((cell) => {
      cell.style.backgroundColor = clear_color;
   });
}

/**
 * Used as a return value to indicate that everythin went proper
 *
 * @param {any} result     The value of a sucessful called function
 * @returns {["ok", any]}  OK status with value
 */
function ok(result) {
   return ["ok", result];
}

/**
 * Used a return value to indicate that something went wrong
 *
 * @param {string} reason        reason for failure
 * @returns {["error", string]}  Error status with message
 */
function error(reason) {
   return ["error", reason];
}
