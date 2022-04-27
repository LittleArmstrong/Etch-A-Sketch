import {
   $,
   $all,
   assign_object,
   is_positive_int,
   is_color,
   is_in_range,
   is_node,
} from "./toolbox.mjs";

class SketchWidget {
   #SYS_SETTINGS_RULES = {
      min_cells_line: [is_positive_int, false],
      max_cells_line: [is_positive_int, false],
   };
   #USER_SETTINGS_RULES = {
      chosen_color: [is_color],
      n_rows: [
         is_in_range,
         this.#SYS_SETTINGS_RULES.min_cells_line,
         this.#SYS_SETTINGS_RULES.max_cells_line,
      ],
      n_cols: [
         is_in_range,
         this.#SYS_SETTINGS_RULES.min_cells_line,
         this.#SYS_SETTINGS_RULES.max_cells_line,
      ],
   };
   #panel;
   #panel_id;
   #real_width;
   #real_height;
   #n_cells;
   #cells;
   #cell_height;
   #cell_width;
   #user_settings = {
      chosen_color: "black",
      n_rows: 60,
      n_cols: 60,
   };
   #sys_settings = {
      min_cells_line: 1,
      max_cells_line: 100,
   };

   constructor(panel_id, sys_settings = null, user_settings = null) {
      // validate values
      if (is_node(panel_id)) {
         this.#panel_id = panel_id;
         this.#panel = $(panel_id);
      } else {
         throw `Node '${panel_id}' not found!`;
      }
      if (sys_settings !== null && typeof sys_settings === "object") {
         //assign changed settings
         assign_object(this.#sys_settings, sys_settings, this.#SYS_SETTINGS_RULES);
      }

      if (this.#sys_settings.min_cells_line > this.#sys_settings.max_cells_line)
         throw new Error("Min limit shouldn't be above max limit!");

      if (user_settings != null && typeof user_settings === "object") {
         assign_object(this.#user_settings, user_settings, this.#USER_SETTINGS_RULES);
      }

      //panel values

      let border_width = this.#panel.style.borderWidth;
      this.#real_width = this.#panel.clientWidth - 2 * border_width; // subtract cause of border-box
      this.#real_height = this.#panel.clientHeight - 2 * border_width; // see above

      //cell values
      this.#n_cells = this.#user_settings.n_cols * this.#user_settings.n_rows;
      this.#cell_height = this.#real_height / this.#user_settings.n_rows;
      this.#cell_width = this.#real_width / this.#user_settings.n_cols;
      this.#cells = $all(this.#panel_id + ">div");

      //create grid
      this.resize_grid();
   }

   resize_grid(n_rows = this.#user_settings.n_rows, n_cols = this.#user_settings.n_cols) {
      this.#set_grid_size(n_rows, n_cols);
      this.#create_grid();
   }

   set_color(color = "black") {
      // check if valid color
      this.#cells[0].style.color = color;
      if (!this.#cells[0].style.color) throw new Error("Invalid color!");
      //set color
      this.#user_settings.chosen_color = color;
   }

   clear() {
      let divs = $all(this.#panel_id + ">div");
      divs.forEach((div) => {
         div.style.backgroundColor = "white";
      });
   }

   #set_grid_size(n_rows, n_cols) {
      if (
         is_in_range(
            n_rows,
            this.#sys_settings.min_cells_line,
            this.#sys_settings.max_cells_line
         ) &&
         is_in_range(n_cols, this.#sys_settings.min_cells_line, this.#sys_settings.max_cells_line)
      ) {
         this.#user_settings.n_rows = n_rows;
         this.#user_settings.n_cols = n_cols;
      } else throw new Error(`Grid values (${n_rows},${n_cols}) not valid!`);
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
         cell.addEventListener("mouseover", (event) => {
            event.target.style.backgroundColor = this.#user_settings.chosen_color;
         });
         this.#panel.appendChild(cell);
      }
   }
}

export default SketchWidget;
