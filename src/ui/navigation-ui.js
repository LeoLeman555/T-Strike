import { resetGameUI } from "./game-ui.js";

const backBtn = document.getElementById("back-to-menu-btn");
const screens = document.querySelectorAll(".screen");

/**
 * Show a screen by its ID, applying transitions and visibility.
 * @param {string} screenId - The ID of the screen to display.
 */
export function showScreen(screenId) {
  const targetScreen = document.getElementById(screenId);

  const currentScreen = Array.from(screens).find(
    (screen) => screen.style.display === "block"
  );

  if (currentScreen && currentScreen !== targetScreen) {
    // Animate transition from current to target screen
    currentScreen.classList.remove("active");
    currentScreen.classList.add("fade-out");

    setTimeout(() => {
      currentScreen.style.display = "none";
      currentScreen.classList.remove("fade-out");

      targetScreen.style.display = "block";

      // Force reflow for animation
      if (screenId === "menu") {
        void targetScreen.offsetWidth;
        requestAnimationFrame(() => targetScreen.classList.add("active"));
      }

      backBtn.style.display = screenId !== "menu" ? "block" : "none";
    }, 300);
  } else {
    // No current screen or navigating to the same screen
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

/**
 * Set up navigation event listeners for UI buttons.
 * This should be called once on app initialization.
 */
export function setupNavigation() {
  document.getElementById("tutorial-btn").addEventListener("click", () => {
    showScreen("tutorial");
  });

  document.getElementById("modes-btn").addEventListener("click", () => {
    showScreen("mode-selection");
    if (typeof window.renderModes === "function") {
      window.renderModes(); // Optional rendering hook
    }
  });

  backBtn.addEventListener("click", () => {
    showScreen("menu");
    resetGameUI();
  });
}
