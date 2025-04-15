let isRunning = false;
let startTime = 0;
let animationFrameId;

const targetTime = 5.0;
const precision = 3;

const timer = document.getElementById("timer");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const target = document.getElementById("target");
const diffMsg = document.getElementById("diff-msg");

const circle = document.querySelector(".progress-ring__circle");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;

target.textContent = targetTime.toFixed(precision);

function triggerShake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 400);
}

function setProgress(progress) {
  const offset = circumference - progress * circumference;
  circle.style.strokeDashoffset = offset;
}

function updateTimer() {
  const now = performance.now();
  const elapsed = (now - startTime) / 1000;
  timer.textContent = elapsed.toFixed(precision) + "s";

  const progress = Math.min(elapsed / targetTime, 1);
  setProgress(progress);

  animationFrameId = requestAnimationFrame(updateTimer);
}

function startTimer() {
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  timer.style.color = "#ffffff";
  circle.setAttribute("stroke", "#ffffff");
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
    timer.style.color = "#00e676";
    circle.setAttribute("stroke", "#00e676");
  } else if (diff <= 0.2) {
    resultMsg.textContent = "👍 Good job!";
    resultMsg.style.color = "#00e676";
    timer.style.color = "#00e676";
    circle.setAttribute("stroke", "#00e676");
  } else if (diff <= 0.5) {
    resultMsg.textContent = "💪 You can do better!";
    resultMsg.style.color = "#ffeb3b";
    timer.style.color = "#ffeb3b";
    circle.setAttribute("stroke", "#ffeb3b");
    triggerShake(timer);
  } else {
    resultMsg.textContent = "❌ Missed!";
    resultMsg.style.color = "#ff5252";
    timer.style.color = "#ff5252";
    circle.setAttribute("stroke", "#ff5252");
    triggerShake(timer);
  }

  timer.textContent = elapsed.toFixed(precision) + "s";
}

button.addEventListener("click", () => {
  if (!isRunning) {
    resetGame();
    startTimer();
    button.textContent = "STOP";
    button.classList.add("stop");
    button.classList.remove("restart");
  } else {
    stopTimer();
    button.textContent = "RESTART";
    button.classList.add("restart");
    button.classList.remove("stop");
  }
});

/** Makes resetGame globally accessible for other modules */
window.resetGame = function () {
  if (isRunning) stopTimer();
  timer.textContent = "0.00s";
  timer.style.color = "#ffffff";
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  button.textContent = "START";
  button.classList.remove("stop");
  button.classList.remove("restart");
  circle.setAttribute("stroke", "#ffffff");
  setProgress(0);
};
