import { applyModeSettings } from "./core/game-core.js";
import { resetGameUI, setupTimerUI } from "./ui/game-ui.js";
import { setupModeUI, renderModes } from "./ui/mode-ui.js";
import { setupNavigation, showScreen } from "./ui/navigation-ui.js";

/** Initializes core UI and game logic */
function init() {
  setupTimerUI(); // Prepare timer display and events
  setupNavigation(); // Set up screen navigation buttons
  renderModes(); // Initial mode rendering
  setupModeUI(onModeSelected); // Set up mode UI handlers
  showScreen("menu"); // Show initial screen
}

/**
 * Callback executed when a mode is selected.
 * @param {string} mode - Selected game mode
 */
function onModeSelected(mode) {
  if (mode === "Endless" || mode === "Perfection") {
    showScreen("game");
    applyModeSettings();
    resetGameUI();
  } else if (mode === "Multiplayer") {
    showScreen("multiplayer");
  }
}

// Run initialization on load
init();
