//Errors

/**
 * Class for creating a validation error
 */
class ValidationError extends Error {
   /**
    * Create a ValidationError Object with a message
    * @param {String} message The error message
    */

   constructor(message) {
      super(message);
      this.name = "ValidationError";
   }
}

// value generating functions

/**
 * Returns a random integer in the specified range
 * @param {Number} max The max value of the range which will be rounded down
 * @param {Number} [min] The min value of the range which will be rounded down
 *    Default is zero
 * @returns
 */
export function get_random_int(max, min = 0) {
   if (typeof max !== "number" || typeof min !== "number")
      throw new TypeError("Values must be of type 'number'!");
   min = Math.floor(min);
   max = Math.ceil(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}
// Node selectors

/**
 * Shortform of document.querySelector
 * @param {String} x The selector to specify the node
 * @returns a node if found
 */

export function $(x) {
   return document.querySelector(x);
}

/**
 * Shortform of document.querySelectorAll
 * @param {String} x The selector to specify the nodes
 * @returns an Array of nodes if found
 */

export function $all(x) {
   return document.querySelectorAll(x);
}

// Validating values

/**
 * Checks if the given value is a positive number
 * @param {Number} value The number to be tested
 * @param {Bool} include_zero Whether zero should be considered as positive or not
 * @returns true or false
 */
export function is_positive_num(value, include_zero = true) {
   if (typeof value !== "number") throw new TypeError("Value not of type 'number'");
   return value > 0 || (value === 0 && include_zero);
}

/**
 * Checks if the given value is a positive integer
 * @param {Number} value The number to be tested
 * @param {Bool} include_zero Whether zero should be considered as positive or not
 * @returns true or false
 */

export function is_positive_int(value, include_zero = true) {
   if (typeof value !== "number") throw new TypeError("Value not of type 'number'!");
   return (value > 0 && value % 1 === 0) || (value === 0 && include_zero);
}

/**
 * Checks if the given String is a valid CSS-Color
 * @param {String} color The color value to be tested
 * @returns true or false
 */
export function is_color(color) {
   if (typeof color !== "string") throw new TypeError("Color value must be of type 'string'!");
   let div = document.createElement("div");
   div.style.color = color;
   return div.style.color !== "";
}

/**
 * Checks if min is less than (or equal) to max
 * @param {[min: Number, max: Number]} range Array that has the min and max number of the range in the same order
 * @param {bool} equal_allowed Whether min equaling max is allowed or not
 * @returns True or false
 */

export function is_range([min, max], equal_allowed = true) {
   console.log(min);
   if (typeof min !== "number" || typeof max !== "number")
      throw new Error("Arguments not of type 'number'!");
   return min < max || (min <= max && equal_allowed);
}

/**
 * Check if value is in the specified range
 * @param {Number} value The value to be tested
 * @param {[min: Number, max. Number]} range The range the value should be in
 * @param {{include_limit:bool, equal_allowed: bool}} settings Settings
 *    include_limit: allow the values to equal the min and max value
 *    equal_allowed: allow min to equal max
 * @returns true or false
 */

export function is_in_range(value, [min, max], { include_limit = true, equal_allowed = true }) {
   if (!is_range([min, max], equal_allowed)) throw new TypeError("Invalid range values!");
   if (typeof value !== "number") throw new TypeError("Value not of type 'number'!");
   return (value > min && value < max) || (value >= min && value <= max && include_limit);
}

/**
 *
 * Checks if the values in an array are in the specified range.
 * @param {Array<Number>} values The values to be tested
 * @param {[min: Number, max:Number]} range The range in which the values should be
 * @param {{include_limit:bool, equal_allowed: bool}} settings Settings
 *    include_limit: allow the values to equal the min and max value
 *    equal_allowed: allow min to equal max
 * @returns true or false
 */
export function are_in_range(values, [min, max], { include_limit = true, equal_allowed = true }) {
   if (!is_range([min, max], equal_allowed))
      throw new TypeError("Given range values aren't valid!");
   if (!Array.isArray(values)) throw new Error("Array expected but not received!");
   return values.every((value) => {
      if (typeof value !== "number")
         throw new TypeError("Value of type 'number' in Array expected but not received!");
      return (value > min && value < max) || (value >= min && value <= max && include_limit);
   });
}
/**
 *
 * Checks if the given selector returns a node
 * @param {String} node_selector selector specifying a node like in CSS
 * @returns true or false
 */
export function is_node(node_selector) {
   return $(node_selector) !== null;
}

// Assigning validated values

/**
 * The key values of obj2 are checked and then assigned to the same keys
 * in obj1
 * @param {Object} obj1 The object the values should be assigned to.
 *    The values of the key should be an object with the key 'value' that
 *    holds the value and 'validate' that holds a function reference that can take
 *    the same values as an argument and returns either true or false.
 *    For example:
 *
 *    {name: {value: thomas, validate: is_string}}
 * @param {Object} obj2 The object that assigns the values
 *    The keys should match the one in obj1
 *    Example:
 *    {name: james}
 * @param {Bool} strict Decides if an error should be thrown if the key in obj2 is not present in obj1
 * @returns an Object with keys and values that had a ValidationError
 */
export function assign_validated_object(obj1, obj2, strict = false) {
   //if arguments aren't objects, throw error
   if (typeof obj1 !== "object" || typeof obj2 !== "object")
      throw new TypeError("Arguments not of type 'object'!");

   //variable with the keys and their values that have a validation error
   let invalid_values = {};

   //iterate through the keys of obj2
   Object.keys(obj2).forEach((key) => {
      //if the same key isn't in obj1 and strict mode is true, throw an error
      if (key in obj1) {
         //if obj1 key values aren't in the specified format, throw an error
         if (typeof obj1[key] !== "object")
            throw new TypeError(`Value of key '${key}' of obj1 not of type 'object'!`);

         if (obj1[key].hasOwnProperty("value") && obj1[key].hasOwnProperty("validate")) {
            if (typeof obj1[key].validate !== "function")
               throw new new TypeError(
                  `Obj1-'${key}' - value of 'validate' doesn't reference a function!`
               )();

            //check if value is valid with the given function
            let value_is_valid = obj1[key].validate(obj2[key]);
            if (value_is_valid === true) obj1[key].value = obj2[key];
            //log the error and save it in the object to return
            else if (value_is_valid === false) {
               console.error(new ValidationError(`Obj2.${key}: ${obj2[key]} - value not valid!`));
               invalid_values[key] = obj2[key];
            }

            //if function doesn't return true or false, throw an error
            else
               throw new TypeError(
                  `Obj1.${key}.validate - return value of function not 'true' or 'false'!`
               );
         } else throw new ReferenceError(`Obj1.${key} - keys 'value' and/or 'validate' not found!`);
      } else if (strict) throw new ReferenceError(`Key '${key}' of obj2 not found in obj1!`);
   });

   return invalid_values;
}
