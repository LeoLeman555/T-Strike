import {
  getAdjacentModes,
  getCurrentMode,
  shiftMode,
} from "../core/mode-core.js";
import { isVisible } from "../utils/dom-utils.js";

const section = document.getElementById("mode-selection");
const currentEl = document.getElementById("current-mode");
const prevEl = document.getElementById("prev-mode");
const nextEl = document.getElementById("next-mode");

/** Renders the mode elements in the DOM */
export function renderModes() {
  const { prev, current, next } = getAdjacentModes();
  currentEl.textContent = current;
  prevEl.textContent = prev;
  nextEl.textContent = next;
}

/** Handles interaction setup for mode selection */
export function setupModeUI(onSelectMode) {
  currentEl.addEventListener("click", () => {
    onSelectMode(getCurrentMode());
  });

  prevEl.addEventListener("click", () => {
    shiftMode(-1);
    renderModes();
  });

  nextEl.addEventListener("click", () => {
    shiftMode(1);
    renderModes();
  });

  document.addEventListener("keydown", (e) => {
    if (!isVisible(section)) return;
    if (e.key === "ArrowUp") {
      shiftMode(-1);
      renderModes();
    } else if (e.key === "ArrowDown") {
      shiftMode(1);
      renderModes();
    } else if (e.key === "Enter") {
      onSelectMode(getCurrentMode());
    }
  });
}
