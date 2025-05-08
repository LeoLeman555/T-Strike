import {
  start,
  stop,
  reset,
  getTargetTime,
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
  getDecimalCount,
  getCircleMargin,
  getCircleVisibility,
  isChronoVisible,
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
const streakDisplay = document.getElementById("current-streak");
const scoreDisplay = document.getElementById("current-score");
const gainDisplay = document.getElementById("score-gain");
const target = document.getElementById("target");
const circle = document.querySelector(".progress-ring-circle");

const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
let circleOffsetBias = 0;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
updateDisplay(0);

/** Set the circular progress indicator */
function setProgress(progress) {
  const interpolatedBias = circleOffsetBias * progress;
  const visualProgress = progress + interpolatedBias;
  const fullRotations = Math.floor(visualProgress);
  const fractionalProgress = visualProgress % 1;
  const effectiveProgress =
    fullRotations % 2 === 0 ? fractionalProgress : 1 - fractionalProgress;
  const offset = circumference - effectiveProgress * circumference;
  circle.style.strokeDashoffset = offset;
}

function setCircleVisibility() {
  circle.style.display = getCircleVisibility() ? "block" : "none";
}

/** Update the timer text and progress circle */
function updateDisplay(elapsed) {
  const capped = elapsed;
  const chronoVisible = isChronoVisible();

  if (chronoVisible) {
    timer.textContent = capped.toFixed(getDecimalCount()) + "s";
    timer.style.opacity = 1;
  } else {
    timer.style.opacity = 0;
  }

  setProgress(capped / getTargetTime());
  target.textContent = getTargetTime().toFixed(getDecimalCount());
}

/** Display result at the end */
function showResult(elapsed) {
  const rounded = Number(elapsed.toFixed(getDecimalCount()));
  const timeDeviation = Math.abs(rounded - getTargetTime());
  const precisionMargin = getPrecisionMargin();

  diffMsg.textContent = `Difference: ${timeDeviation.toFixed(
    getDecimalCount()
  )}s`;

  const precisionPercentage = Math.max(
    0,
    100 - (timeDeviation / getTargetTime()) * 100
  );
  updateDisplay(elapsed);

  timer.style.opacity = 1;
  timer.textContent = elapsed.toFixed(getDecimalCount()) + "s";

  let feedbackColor;

  console.log(`Precision: ${precisionPercentage.toFixed(getDecimalCount())}%`);

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
  updateStreakUI(feedbackColor, true);
}

/** Update UI colors and result message */
function displayFeedback(message, color) {
  applyFeedbackColor(timer, resultMsg, circle, color, message);
}

/** Update score streak display */
export function updateStreakUI(feedbackColor, shouldAnimate) {
  streakDisplay.classList.remove("roll-up", "pulse");
  void streakDisplay.offsetWidth;
  if (shouldAnimate) {
    triggerRollUp(
      streakDisplay,
      () => {
        streakDisplay.textContent = getStreak();
      },
      () => {
        triggerPulse(streakDisplay);
        updateGainUI(feedbackColor, shouldAnimate);
      },
      250
    );
  } else {
    streakDisplay.textContent = getStreak();
  }
}

/** Update score display */
export function updateScoreUI(shouldAnimate) {
  scoreDisplay.textContent = getScore();
  if (shouldAnimate) {
    triggerPulse(scoreDisplay);
  }
}

/** Update score gain display */
export function updateGainUI(color, shouldAnimate) {
  gainDisplay.textContent = `+${getGain()}`;
  gainDisplay.style.color = color;
  if (shouldAnimate) {
    triggerGainAnimation(gainDisplay, () => updateScoreUI(shouldAnimate));
  }
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
  scoreDisplay.classList.remove("pulse");
  streakDisplay.classList.remove("pulse");
  streakDisplay.classList.remove("roll-up");
  gainDisplay.classList.remove("animate");
  gainDisplay.classList.add("hidden");

  const circleMargin = getCircleMargin();
  setCircleVisibility();
  circle.setAttribute("stroke", "#ffffff");
  circleOffsetBias = Math.min(
    Math.max((Math.random() * 2 - 1) * circleMargin, -circleMargin),
    circleMargin
  );
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
