import { $, $all, assign_object } from "./toolbox.mjs";

const sketch_container = $("#sketch-container");

//set resolution of panel

const panel_resolution = $("#resolution");

panel_resolution.value = n_divs_row;
panel_resolution_copy.textContent = n_divs_row;

panel_resolution.addEventListener("change", (event) => {
   let value = Number(event.target.value);
   if (value !== NaN && value >= min_resolution && value <= max_resolution) {
      event.target.value = value;
      panel_resolution_copy.textContent = value;
      n_divs_row = value; //defauöt
      n_divs_col = n_divs_row;
      n_divs = n_divs_row * n_divs_col;
      element_size = sketch_size / n_divs_row;
      set_resolution();
      set_color();
      event.target.blur();
   }
});

class SketchWidget {
   #panel_id;
   #panel;
   #real_width;
   #real_height;
   #n_rows;
   #n_cols;
   #n_cells;
   #cells;
   #cell_height;
   #cell_width;
   #chosen_color = "black";
   #settings = {
      min_cells_line: 1,
      max_cells_line: 100,
      n_rows: 60,
      n_cols: 60,
   };

   constructor(panel_id, settings = null) {
      //assign changed settings
      if (a !== null && typeof a === "object") {
         assign_object(this.settings, settings);
      }
      //panel
      this.#panel_id = panel_id;
      this.#panel = $(panel_id);
      let border_width = this.#panel.style.borderWidth;
      this.#real_width = this.#panel.clientWidth - 2 * border_width; // subtract cause of border-box
      this.#real_height = this.#panel.clientHeight - 2 * border_width; // see above

      //cells
      this.#n_cells = n_cols * n_rows;
      this.#cell_height = this.#real_height / this.#n_rows;
      this.#cell_width = this.#real_width / this.#n_cols;
      this.#cells = $all(this.#panel_id + ">div");
      //create grid
      this.resize_grid();
   }

   resize_grid(n_rows, n_cols = n_rows) {
      let status = this.#set_grid_size(n_rows, n_cols);
      if (status === "ERROR") return status;
      this.#create_grid();
      this.set_color();
   }

   set_color(color = "black") {
      // check if valid color
      this.#cells[0].style.color = color;
      if (!this.#cells[0].style.color) return "ERROR";
      //set color
      this.#chosen_color = color;
   }

   clear() {
      let divs = $all(this.#panel_id + ">div");
      divs.forEach((div) => {
         div.style.backgroundColor = "white";
      });
   }

   #set_grid_size(n_rows, n_cols) {
      if (
         n_rows >= this.settings.min_cells_line &&
         n_cols >= this.settings.min_cells_line &&
         n_rows <= this.settings.max_cells_line &&
         n_cols <= this.settings.max_cells_line
      ) {
         this.#n_rows = n_rows;
         this.#n_cols = n_cols;
      } else return "ERROR";
   }

   #create_grid() {
      //remove previous grid
      while (this.#panel.firstChild) {
         this.#panel.removeChild(this.#panel.lastChild);
      }
      //create new one
      for (let i = 0; i < this.#n_cells; i++) {
         let cell = document.createElement("div");
         //cell size
         cell.style.width = this.#cell_width + "px";
         cell.style.height = this.#cell_height + "px";
         //sketching through clicking on cell
         cell.addEventListener("click", (cell) => {
            cell.style.backgroundColor = this.#chosen_color;
         });
         this.#panel.appendChild(cell);
      }
   }
}

export default SketchWidget;
