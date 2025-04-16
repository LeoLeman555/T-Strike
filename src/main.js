import { setupTimerUI } from "./ui/timer-ui.js";
import { setupModeUI, renderModes } from "./ui/mode-ui.js";
import { setupNavigation, showScreen } from "./ui/navigation-ui.js";

setupTimerUI();
setupModeUI((mode) => {
  if (mode === "Classic") {
    showScreen("game");
  }
});
setupNavigation();
renderModes();
showScreen("menu");
