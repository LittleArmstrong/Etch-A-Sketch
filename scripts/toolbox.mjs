export function get_random_int(min, max) {
   min = Math.floor(min);
   max = Math.ceil(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}

export function $(x) {
   return document.querySelector(x);
}

export function $all(x) {
   return document.querySelectorAll(x);
}

// strict = true: throw error if key not found in rules
// alt_obj: object with default values for the keys
// rules: object with arrays for every key where [function, arg2, arg3, ...]. arg1 ist the value of obj2 that needs to be checked
// The function should check the validitiy of the values of obj2 and return true or false
export function assign_object(obj1, obj2, rules = null, strict = true, alt_obj = null) {
   Object.keys(obj2).forEach((key) => {
      if (key in obj1) {
         let value = obj2[key];
         if (rules !== null) {
            if (rules.hasOwnProperty(key)) {
               let args = rules[key].slice(1);
               let passed = false;
               if (args.length !== 0) {
                  passed = rules[key][0](value, ...args);
               } else {
                  passed = rules[key][0](value);
               }
               if (passed) {
                  obj1[key] = value;
               } else if (alt_obj !== null && alt_obj.hasOwnProperty(key)) {
                  obj1[key] = alt_obj[key];
               } else {
                  throw `Invalid value '${value}' for key '${key}'! No default value found.`;
               }
            } else if (strict) {
               throw `No validation rules for key '${key}' found!`;
            } else {
               obj1[key] = obj2[key];
            }
         } else {
            obj1[key] = obj2[key];
         }
      }
   });
}

export function is_positive_num(value, include_zero = true) {
   if (typeof value === "number") {
      return value > 0 || (value === 0 && include_zero);
   }
   return false;
}

export function is_positive_int(value, include_zero = true) {
   if (typeof value === "number") {
      return (value > 0 && value % 1 === 0) || (value === 0 && include_zero);
   }
   return false;
}
