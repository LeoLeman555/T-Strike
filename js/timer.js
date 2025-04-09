let isRunning = false;
let startTime = 0;
let animationFrameId;

const targetTime = 5.0;
const precision = 3;

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
  const roundedElapsed = Number(elapsed.toFixed(precision));
  const diff = Math.abs(roundedElapsed - targetTime);

  diffMsg.textContent = `Difference: ${diff.toFixed(precision)}s`;

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

/** Makes resetGame globally accessible for other modules */
window.resetGame = function () {
  if (isRunning) stopTimer();
  display.textContent = "0.00s";
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  button.textContent = "Start";
};
