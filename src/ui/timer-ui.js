import {
  start,
  stop,
  reset,
  getTargetTime,
  getPrecision,
  isTimerRunning,
} from "../core/timer-core.js";
import { triggerShake } from "../utils/effects.js";

const timer = document.getElementById("timer");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const diffMsg = document.getElementById("diff-msg");
const target = document.getElementById("target");
const circle = document.querySelector(".progress-ring__circle");

const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
target.textContent = getTargetTime().toFixed(getPrecision());

/** Sets the circular progress indicator */
function setProgress(progress) {
  const offset = circumference - progress * circumference;
  circle.style.strokeDashoffset = offset;
}

/** Updates the timer text and progress circle */
function updateDisplay(elapsed) {
  const capped = elapsed;
  timer.textContent = capped.toFixed(getPrecision()) + "s";
  setProgress(capped / getTargetTime());
}

/** Displays result at the end */
function showResult(elapsed) {
  const rounded = Number(elapsed.toFixed(getPrecision()));
  const diff = Math.abs(rounded - getTargetTime());

  diffMsg.textContent = `Difference: ${diff.toFixed(getPrecision())}s`;
  timer.textContent = rounded.toFixed(getPrecision()) + "s";

  if (diff <= 0.01) {
    displayFeedback("🎯 Perfect!", "#00e676");
  } else if (diff <= 0.2) {
    displayFeedback("👍 Good job!", "#00e676");
  } else if (diff <= 0.5) {
    displayFeedback("💪 You can do better!", "#ffeb3b");
    triggerShake(timer);
  } else {
    displayFeedback("❌ Missed!", "#ff5252");
    triggerShake(timer);
  }
}

/** Updates UI colors and result message */
function displayFeedback(message, color) {
  resultMsg.textContent = message;
  resultMsg.style.color = color;
  timer.style.color = color;
  circle.setAttribute("stroke", color);
}

/** Resets the timer UI */
export function resetTimerUI() {
  reset();
  timer.textContent = "0.00s";
  timer.style.color = "#ffffff";
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  button.textContent = "START";
  button.classList.remove("stop", "restart");
  circle.setAttribute("stroke", "#ffffff");
  setProgress(0);
}

/** Starts or stops timer on button click */
export function setupTimerUI() {
  button.addEventListener("click", () => {
    if (!isTimerRunning()) {
      resetTimerUI();
      start(updateDisplay);
      button.textContent = "STOP";
      button.classList.add("stop");
      button.classList.remove("restart");
    } else {
      const elapsed = stop();
      showResult(elapsed);
      button.textContent = "RESTART";
      button.classList.add("restart");
      button.classList.remove("stop");
    }
  });
}
