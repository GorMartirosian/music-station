import { musicSearchEvent } from "./searchbar.js";

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

function start() {
  musicSearchEvent();
}