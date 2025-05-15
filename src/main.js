import { applyModeSettings } from "./core/game-core.js";
import { resetGameUI, setupTimerUI } from "./ui/game-ui.js";
import { setupModeUI, renderModes } from "./ui/mode-ui.js";
import { setupNavigation, showScreen } from "./ui/navigation-ui.js";

setupTimerUI();
setupModeUI((mode) => {
  if (mode === "Endless" || mode === "Perfection") {
    showScreen("game");
    applyModeSettings();
    resetGameUI();
  }
  if (mode === "Multiplayer") {
    showScreen("multiplayer");
  }
});
setupNavigation();
renderModes();
showScreen("menu");
