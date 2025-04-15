const backBtn = document.getElementById("back-to-menu-btn");
const screens = document.querySelectorAll(".screen");
const menu = document.getElementById("menu");

function showScreen(screenId) {
  const targetScreen = document.getElementById(screenId);

  // Trouve l'écran actuellement visible
  const currentScreen = Array.from(screens).find(
    (screen) => screen.style.display === "block"
  );

  // S'il y a un écran actif et on va vers un autre, on fade-out l'actuel
  if (currentScreen && currentScreen !== targetScreen) {
    currentScreen.classList.remove("active");
    currentScreen.classList.add("fade-out");

    // Attendre la fin de l'animation de sortie
    setTimeout(() => {
      currentScreen.style.display = "none";
      currentScreen.classList.remove("fade-out");

      // Affiche le nouveau screen avec animation
      targetScreen.style.display = "block";
      if (screenId === "menu") {
        targetScreen.classList.remove("active"); // clean in case it's still there

        // Force reflow to restart animation
        void targetScreen.offsetWidth;

        requestAnimationFrame(() => {
          targetScreen.classList.add("active");
        });
      }

      backBtn.style.display = screenId !== "menu" ? "block" : "none";
    }, 300); // doit correspondre au timing du CSS
  } else {
    // Aucun écran actif (au démarrage)
    screens.forEach((screen) => {
      screen.style.display = "none";
      screen.classList.remove("active");
    });
    targetScreen.style.display = "block";
    if (screenId === "menu") {
      requestAnimationFrame(() => {
        targetScreen.classList.add("active");
      });
    }
    backBtn.style.display = screenId !== "menu" ? "block" : "none";
  }
}

showScreen("menu");

document.getElementById("tutorial-btn").addEventListener("click", () => {
  showScreen("tutorial");
});

document.getElementById("modes-btn").addEventListener("click", () => {
  showScreen("mode-selection");
  window.renderModes();
});

backBtn.addEventListener("click", () => {
  showScreen("menu");
  if (typeof resetGame === "function") {
    resetGame(); // resets game if defined in timer.js
  }
});

window.showScreen = showScreen;
