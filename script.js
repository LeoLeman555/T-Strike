let isRunning = false;
let startTime = 0;
let animationFrameId;

const targetTime = 5.0;
const precision = 3; // Increase for more decimals 0 to 3

const display = document.getElementById("display");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const target = document.getElementById("target");
const diffMsg = document.getElementById("diff-msg");

target.textContent = targetTime.toFixed(precision);

function updateTimer() {
  const now = performance.now();
  const elapsed = (now - startTime) / 1000;
  display.textContent = elapsed.toFixed(precision) + "s";

  animationFrameId = requestAnimationFrame(updateTimer);
}

function startTimer() {
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  startTime = performance.now();
  isRunning = true;
  animationFrameId = requestAnimationFrame(updateTimer);
}

function stopTimer() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);

  const elapsed = (performance.now() - startTime) / 1000;
  // Round elapsed to match chosen precision level (for fair scoring)
  const roundedElapsed = Number(elapsed.toFixed(precision));
  const diff = Math.abs(roundedElapsed - targetTime);

  diffMsg.textContent = `Difference : ${diff.toFixed(precision)}s`;
  if (diff <= 0.01) {
    resultMsg.textContent = "🎯 Perfect!";
    resultMsg.style.color = "#00e676";
  } else if (diff <= 0.2) {
    resultMsg.textContent = "👍 Good job!";
    resultMsg.style.color = "#00e676";
  } else if (diff <= 0.5) {
    resultMsg.textContent = "💪 You can do better!";
    resultMsg.style.color = "#ffeb3b";
  } else {
    resultMsg.textContent = "❌ Missed!";
    resultMsg.style.color = "#ff5252";
  }

  display.textContent = elapsed.toFixed(precision) + "s";
}

button.addEventListener("click", () => {
  if (!isRunning) {
    startTimer();
    button.textContent = "Stop";
  } else {
    stopTimer();
    button.textContent = "Start";
  }
});

const backBtn = document.getElementById("back-to-menu-btn");
const screens = document.querySelectorAll(".screen");
const menu = document.getElementById("menu");

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";

  if (screenId !== "menu") {
    backBtn.style.display = "block";
  } else {
    backBtn.style.display = "none";
  }
}

document.getElementById("tutorial-btn").addEventListener("click", () => {
  showScreen("tutorial");
});

document.getElementById("modes-btn").addEventListener("click", () => {
  showScreen("game");
});

backBtn.addEventListener("click", () => {
  showScreen("menu");
  resetGame();
});
