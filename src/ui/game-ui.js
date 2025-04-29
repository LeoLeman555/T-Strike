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
  getPrecisionMargin,
} from "../core/game-core.js";

import {
  triggerShake,
  triggerPulse,
  triggerRollUp,
  triggerGainAnimation,
  applyFeedbackColor,
} from "../utils/effects.js";

const timer = document.getElementById("timer");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const diffMsg = document.getElementById("time-difference-msg");
const streak = document.getElementById("current-streak");
const scoreDisplay = document.getElementById("current-score");
const gainDisplay = document.getElementById("score-gain");
const target = document.getElementById("target");
const circle = document.querySelector(".progress-ring-circle");

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
  const timeDeviation = Math.abs(rounded - getTargetTime());
  const precisionMargin = getPrecisionMargin();

  diffMsg.textContent = `Difference: ${timeDeviation.toFixed(getPrecision())}s`;

  const precisionPercentage = Math.max(
    0,
    100 - (timeDeviation / getTargetTime()) * 100
  );
  updateDisplay(elapsed);

  let feedbackColor;

  console.log(`Precision: ${precisionPercentage.toFixed(getPrecision())}%`);

  if (precisionPercentage >= 100 - precisionMargin * 0.01) {
    feedbackColor = "#00e676";
    displayFeedback("🎯 Perfect!", feedbackColor);
    incrementStreak();
  } else if (precisionPercentage >= 100 - precisionMargin * 0.2) {
    feedbackColor = "#67e535";
    displayFeedback("👍 Good job!", feedbackColor);
    incrementStreak();
  } else if (precisionPercentage >= 100 - precisionMargin) {
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

  updateGain(computeScore(timeDeviation, getStreak()));
  updateScore(getGain());
  updateStreakUI(feedbackColor);
}

/** Update UI colors and result message */
function displayFeedback(message, color) {
  applyFeedbackColor(timer, resultMsg, circle, color, message);
}

/** Update score streak display */
export function updateStreakUI(feedbackColor) {
  streak.classList.remove("roll-up", "pulse");
  void streak.offsetWidth;
  triggerRollUp(
    streak,
    () => {
      streak.textContent = getStreak();
    },
    () => {
      triggerPulse(streak);
      updateGainUI(feedbackColor);
    },
    250
  );
}

/** Update score display */
export function updateScoreUI() {
  scoreDisplay.textContent = getScore();
  triggerPulse(scoreDisplay);
}

/** Update score gain display */
export function updateGainUI(color) {
  gainDisplay.textContent = `+${getGain()}`;
  gainDisplay.style.color = color;
  triggerGainAnimation(gainDisplay, updateScoreUI);
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
