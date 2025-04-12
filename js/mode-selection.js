const modes = ["Classic", "Endless", "Multiplayer"];
let currentModeIndex = 0;

const modeSection = document.getElementById("mode-selection");
const currentEl = document.getElementById("current-mode");
const prevEl = document.getElementById("prev-mode");
const nextEl = document.getElementById("next-mode");

// Update the mode display based on the current index.
function renderModes() {
  const total = modes.length;
  const prevIndex = (currentModeIndex - 1 + total) % total;
  const nextIndex = (currentModeIndex + 1) % total;

  currentEl.textContent = modes[currentModeIndex];
  prevEl.textContent = modes[prevIndex];
  nextEl.textContent = modes[nextIndex];
}

// Handle mode selection and trigger related screen.
function selectMode(modeName) {
  if (modeName === "Classic") {
    window.showScreen("game");
  }
  console.log(`Selected mode: ${modeName}`);
}

// Check if an element is visible in the DOM.
const isVisible = (el) => {
  return !!el && window.getComputedStyle(el).display !== "none";
};

// Click handling
currentEl.addEventListener("click", () => {
  selectMode(modes[currentModeIndex]);
});

prevEl.addEventListener("click", () => {
  currentModeIndex = (currentModeIndex - 1 + modes.length) % modes.length;
  renderModes();
});

nextEl.addEventListener("click", () => {
  currentModeIndex = (currentModeIndex + 1) % modes.length;
  renderModes();
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!isVisible(modeSection)) return;

  if (e.key === "ArrowUp") {
    currentModeIndex = (currentModeIndex - 1 + modes.length) % modes.length;
    renderModes();
  } else if (e.key === "ArrowDown") {
    currentModeIndex = (currentModeIndex + 1) % modes.length;
    renderModes();
  } else if (e.key === "Enter") {
    selectMode(modes[currentModeIndex]);
  }
});

window.renderModes = renderModes;
