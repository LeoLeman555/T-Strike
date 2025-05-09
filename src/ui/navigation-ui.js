import { resetStreak, resetScore, resetGain } from "../core/game-core.js";
import {
  updateStreakUI,
  resetTimerUI,
  updateScoreUI,
  updateGainUI,
  updatePrecisionUI,
} from "./game-ui.js";

const backBtn = document.getElementById("back-to-menu-btn");
const screens = document.querySelectorAll(".screen");

/** Display one screen with transitions */
export function showScreen(screenId) {
  const targetScreen = document.getElementById(screenId);

  const currentScreen = Array.from(screens).find(
    (screen) => screen.style.display === "block"
  );

  if (currentScreen && currentScreen !== targetScreen) {
    currentScreen.classList.remove("active");
    currentScreen.classList.add("fade-out");

    setTimeout(() => {
      currentScreen.style.display = "none";
      currentScreen.classList.remove("fade-out");

      targetScreen.style.display = "block";
      if (screenId === "menu") {
        void targetScreen.offsetWidth;
        requestAnimationFrame(() => targetScreen.classList.add("active"));
      }

      backBtn.style.display = screenId !== "menu" ? "block" : "none";
    }, 300);
  } else {
    screens.forEach((s) => {
      s.style.display = "none";
      s.classList.remove("active");
    });
    targetScreen.style.display = "block";
    if (screenId === "menu") {
      requestAnimationFrame(() => targetScreen.classList.add("active"));
    }
    backBtn.style.display = screenId !== "menu" ? "block" : "none";
  }
}

/** Handle UI navigation buttons */
export function setupNavigation() {
  document.getElementById("tutorial-btn").addEventListener("click", () => {
    showScreen("tutorial");
  });

  document.getElementById("modes-btn").addEventListener("click", () => {
    showScreen("mode-selection");
    if (typeof window.renderModes === "function") window.renderModes();
  });

  backBtn.addEventListener("click", () => {
    showScreen("menu");
    resetTimerUI();
    resetStreak();
    resetScore();
    resetGain();
    updateStreakUI("#ff5252", false);
    updateScoreUI(false);
    updateGainUI(false);
    updatePrecisionUI(0);
  });
}
