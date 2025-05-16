import {
  getAdjacentModes,
  getCurrentMode,
  getMode,
  shiftMode,
  updateMode,
} from "../core/mode-core.js";

const section = document.getElementById("mode-selection");
const currentMode = document.getElementById("current-mode");
const previousMode = document.getElementById("prev-mode");
const nextMode = document.getElementById("next-mode");

/**
 * Render the current, previous, and next modes in the DOM.
 */
export function renderModes() {
  const { prev, current, next } = getAdjacentModes();
  currentMode.textContent = current;
  previousMode.textContent = prev;
  nextMode.textContent = next;
}

/**
 * Set up UI interaction for mode selection.
 * @param {function(string):void} onSelectMode - Callback called on mode confirm.
 */
export function setupModeUI(onSelectMode) {
  currentMode.addEventListener("click", () => {
    updateMode(getCurrentMode());
    console.log(`[INFO] Mode ${getMode()}`);
    onSelectMode(getMode());
  });

  previousMode.addEventListener("click", () => {
    shiftMode(-1);
    renderModes();
  });

  nextMode.addEventListener("click", () => {
    shiftMode(1);
    renderModes();
  });

  document.addEventListener("keydown", (e) => {
    // Only allow navigation if mode section is visible
    const visible =
      section && window.getComputedStyle(section).display !== "none";
    if (!visible) return;

    if (e.key === "ArrowUp") {
      shiftMode(-1);
      renderModes();
    } else if (e.key === "ArrowDown") {
      shiftMode(1);
      renderModes();
    } else if (e.key === "Enter") {
      updateMode(getCurrentMode());
      console.log(`[INFO] Mode ${getMode()}`);
      onSelectMode(getMode());
    }
  });
}
