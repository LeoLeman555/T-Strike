import {
  start,
  stop,
  reset,
  getTargetTime,
  getPrecision,
  isTimerRunning,
  getStreak,
  incrementStreak,
  resetStreak,
  computeScore,
  getScore,
  updateScore,
  resetScore,
  getGain,
  updateGain,
} from "../core/game-core.js";
import { triggerShake } from "../utils/effects.js";

const timer = document.getElementById("timer");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const diffMsg = document.getElementById("diff-msg");
const streak = document.getElementById("current-streak");
const scoreDisplay = document.getElementById("current-score");
const gainDisplay = document.getElementById("score-gain");
const target = document.getElementById("target");
const circle = document.querySelector(".progress-ring__circle");

const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
target.textContent = getTargetTime().toFixed(getPrecision());

/** Set the circular progress indicator */
function setProgress(progress) {
  const offset = circumference - progress * circumference;
  circle.style.strokeDashoffset = offset;
}

/** Update the timer text and progress circle */
function updateDisplay(elapsed) {
  const capped = elapsed;
  timer.textContent = capped.toFixed(getPrecision()) + "s";
  setProgress(capped / getTargetTime());
}

/** Display result at the end */
function showResult(elapsed) {
  const rounded = Number(elapsed.toFixed(getPrecision()));
  const diff = Math.abs(rounded - getTargetTime());

  diffMsg.textContent = `Difference: ${diff.toFixed(getPrecision())}s`;
  timer.textContent = rounded.toFixed(getPrecision()) + "s";

  let feedbackColor;

  if (diff <= 0.01) {
    feedbackColor = "#00e676";
    displayFeedback("🎯 Perfect!", feedbackColor);
    incrementStreak();
  } else if (diff <= 0.2) {
    feedbackColor = "#67e535";
    displayFeedback("👍 Good job!", feedbackColor);
    incrementStreak();
  } else if (diff <= 0.5) {
    feedbackColor = "#ffeb3b";
    displayFeedback("💪 You can do better!", feedbackColor);
    triggerShake(timer);
  } else {
    feedbackColor = "#ff5252";
    displayFeedback("❌ Missed!", feedbackColor);
    triggerShake(timer);
    resetStreak();
    resetScore();
  }
  updateGain(computeScore(diff, getStreak()));
  updateScore(getGain());
  updateStreakUI();
  updateGainUI(feedbackColor);
}

/** Update UI colors and result message */
function displayFeedback(message, color) {
  resultMsg.textContent = message;
  resultMsg.style.color = color;
  timer.style.color = color;
  circle.setAttribute("stroke", color);
}

/** Update score streak display.*/
export function updateStreakUI() {
  streak.textContent = getStreak();
}

/** Update score display */
export function updateScoreUI() {
  scoreDisplay.textContent = getScore();
  scoreDisplay.classList.add("pulse");
  scoreDisplay.addEventListener(
    "animationend",
    () => {
      scoreDisplay.classList.remove("pulse");
    },
    { once: true }
  );
}

/** Update score gain display */
export function updateGainUI(color) {
  gainDisplay.textContent = `+${getGain()}`;
  gainDisplay.classList.remove("hidden");
  gainDisplay.style.color = color;
  void gainDisplay.offsetWidth;
  gainDisplay.classList.add("animate");
  gainDisplay.addEventListener(
    "transitionend",
    () => {
      gainDisplay.classList.remove("animate");
      gainDisplay.classList.add("hidden");
      updateScoreUI();
    },
    { once: true }
  );
}

/** Reset the timer UI */
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

/** Start or stop timer on button click */
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
