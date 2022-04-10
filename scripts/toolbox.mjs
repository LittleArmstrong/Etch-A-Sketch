export function get_random_int(min, max) {
   min = Math.floor(min);
   max = Math.ceil(max);
   return Math.floor(Math.random() * (max - min + 1) + min);
}

export function $(x) {
   return document.getElementById(x);
}
