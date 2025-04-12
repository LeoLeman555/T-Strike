const backBtn = document.getElementById("back-to-menu-btn");
const screens = document.querySelectorAll(".screen");
const menu = document.getElementById("menu");

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
  backBtn.style.display = screenId !== "menu" ? "block" : "none";
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
