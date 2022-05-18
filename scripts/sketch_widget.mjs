import { $ } from "./toolbox.mjs";

const canvas = {
   node: $("#sketch-container"),
   set_to_border_box() {
      this.node.setAttribute("box-sizing", "border-box");
   },
   get size() {
      const height = this.node.clientHeight - 2 * this.node.style.borderWidth;
      const width = this.node.clientWidth - 2 * this.node.style.borderWidth;
      return { height: height, width: width };
   },
   get_validated_size() {
      return this.validate_size(this.size);
   },

   validate_size({ width, height }) {
      const min_height =
         this.resolution_settings.min_size.height * this.resolution_settings.limit.height[1];
      const min_width =
         this.resolution_settings.min_size.width * this.resolution_settings.limit.width[1];
      if (height < min_height || width < min_width) return error("Invalid size");
      return ok({ width: width, height: height });
   },
   resolution_settings: {
      IO: { width: $("#cols"), height: $("#rows") },
      apply_button: $("#resize-btn"),
      limit: { width: [1, 100], height: [1, 100] },
      min_size: { width: 1, height: 1 },
      default: { width: 60, height: 60 },
      invalid_input_class: "invalid-number",
   },
   change_resolution(grid) {
      this.node.replaceChildren(...grid.children);
   },
   validate_resolution({ width, height }) {
      if (!Number.isInteger(width) || !Number.isInteger(height)) return error("Invalid type");
      const width_in_range =
         width >= this.resolution_settings.limit.width[0] &&
         width <= this.resolution_settings.limit.width[1];
      const height_in_range =
         height >= this.resolution_settings.limit.height[0] &&
         height <= this.resolution_settings.limit.height[1];
      if (!width_in_range || !height_in_range) return error("Value out of range");
      return ok({ width: width, height: height });
   },
   read_resolution() {
      const width = Number(this.resolution_settings.IO.width.value);
      const height = Number(this.resolution_settings.IO.height.value);
      return { width: width, height: height };
   },
   read_validated_resolution() {
      return this.validate_resolution(this.read_resolution());
   },
   write_resolution({ width, height }) {
      this.resolution_settings.IO.height.value = height;
      this.resolution_settings.IO.width.value = width;
   },
   write_default_resolution() {
      this.write_resolution(this.resolution_settings.default);
   },
   show_valid_resolution_input() {
      this.resolution_settings.IO.width.classList.remove(
         this.resolution_settings.invalid_input_class
      );
      this.resolution_settings.IO.height.classList.remove(
         this.resolution_settings.invalid_input_class
      );
   },
   show_invalid_resolution_input() {
      this.resolution_settings.IO.width.classList.add(this.resolution_settings.invalid_input_class);
      this.resolution_settings.IO.height.classList.add(
         this.resolution_settings.invalid_input_class
      );
   },
   paint_settings: {
      color: "black",
      is_active: false,
   },
   add_paint_function() {
      Array.from(this.node.children).forEach((cell) => {
         cell.addEventListener("mouseover", (event) => {
            if (this.paint_settings.is_active)
               event.target.style.backgroundColor = this.paint_settings.color;
         });
      });
   },
   clear_settings: {
      button: $("#clear-btn"),
      color: "white",
   },
   clear() {
      Array.from(this.node.children).forEach((cell) => {
         cell.style.backgroundColor = this.clear_settings.color;
      });
   },
   bind_events() {
      // allow painting only if mouse button is being pressed down
      this.node.addEventListener("mousedown", () => {
         this.paint_settings.is_active = true;
      });
      canvas.node.addEventListener("mouseup", () => {
         this.paint_settings.is_active = false;
      });

      // add reize function to resize button ("Apply")
      this.resolution_settings.apply_button.addEventListener("click", () => {
         set_resolution();
      });

      // add clear function to clear button ("Clear")
      this.clear_settings.button.addEventListener("click", () => {
         this.clear();
      });
   },
};

// validation

const SketchWidget = {
   init() {
      canvas.bind_events();

      canvas.set_to_border_box();
      canvas.write_default_resolution();
      set_resolution();

      return this;
   },
};

function set_resolution() {
   const [canvas_size_status, canvas_size] = canvas.get_validated_size();
   switch (canvas_size_status) {
      case "ok":
         break;
      case "error":
         return error(canvas_size);
      default:
         throw new Error("Invalid case");
   }

   const [resolution_status, resolution] = canvas.read_validated_resolution();
   switch (resolution_status) {
      case "ok":
         canvas.show_valid_resolution_input();
         break;
      case "error":
         canvas.show_invalid_resolution_input();
         return error(resolution);
      default:
         throw new Error("Invalid case");
   }

   const cell_size = calc_cell_size(resolution, canvas_size);

   const cell_amount = calc_cell_amount(resolution);

   const grid = create_grid(cell_amount, cell_size);

   canvas.change_resolution(grid);
   canvas.add_paint_function();
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

function calc_cell_size(resolution, canvas_size) {
   const cell_size = {};
   cell_size.width = canvas_size.width / resolution.width;
   cell_size.height = canvas_size.height / resolution.height;
   return cell_size;
}

function calc_cell_amount(cells_in) {
   return cells_in.width * cells_in.height;
}

function ok(result) {
   return ["ok", result];
}

function error(reason) {
   return ["error", reason];
}

export default SketchWidget;
