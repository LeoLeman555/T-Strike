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
  isChronoInvertedActive,
  computePrecision,
  recordPrecision,
  getPrecisionDelta,
  resetPrecisionHistory,
  resetGain,
  getMaxGain,
  getAveragePrecision,
  getAverageScore,
} from "../core/game-core.js";

import {
  triggerShake,
  triggerPulse,
  triggerRollUp,
  triggerGainAnimation,
  applyFeedbackColor,
  animateCircleVisibility,
  triggerDirectionFlip,
  triggerFloatUp,
} from "../utils/effects.js";
import { showScreen } from "./navigation-ui.js";
import { getMode } from "../core/mode-core.js";

const modeTitle = document.getElementById("mode-title");
const timer = document.getElementById("timer");
const button = document.getElementById("start-stop-btn");
const newGameButton = document.getElementById("btn-restart");
const resultMsg = document.getElementById("result-msg");
const diffMsg = document.getElementById("time-difference-msg");
const streakDisplay = document.getElementById("current-streak");
const scoreDisplay = document.getElementById("current-score");
const precisionDisplay = document.getElementById("current-precision");
export const differenceDisplay = document.getElementById(
  "precision-difference"
);
const gainDisplay = document.getElementById("score-gain");
const target = document.getElementById("target");
const targetTimeDisplay = document.querySelector(".target-time");
const circle = document.querySelector(".progress-ring-circle");

const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
let circleOffsetBias = 0;

let previousDirection = 1; // 1 = normal, -1 = reverse

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
updateDisplay(0);

function isPerfectionMode() {
  return getMode() === "Perfection";
}

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
  if (!getCircleVisibility()) {
    animateCircleVisibility(circle);
  } else {
    circle.classList.remove("circle-fade-out");
    circle.style.display = "block";
    circle.style.opacity = 1;
  }
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

  const currentDirection = Math.sign(!isChronoInvertedActive());
  if (currentDirection !== previousDirection) {
    triggerDirectionFlip(timer);
    previousDirection = currentDirection;
  }

  setProgress(capped / getTargetTime());
  target.textContent = getTargetTime().toFixed(getDecimalCount());
  streakDisplay.style.color = "#ffffff";
  streakDisplay.style.textShadow = "0 0 5px #ffffff, 0 0 10px #ffffff";
  scoreDisplay.style.color = "#ffffff";
  scoreDisplay.style.textShadow = "0 0 5px #ffffff, 0 0 10px #ffffff";
  precisionDisplay.style.color = "#ffffff";
  precisionDisplay.style.textShadow = "0 0 5px #ffffff, 0 0 10px #ffffff";
}

/** Display result at the end */
function showResult(elapsed) {
  const targetTime = getTargetTime();
  const rounded = Number(elapsed.toFixed(getDecimalCount()));
  const timeDeviation = Math.abs(rounded - targetTime);
  const precisionMargin = getPrecisionMargin();

  diffMsg.textContent = `Difference: ${timeDeviation.toFixed(
    getDecimalCount()
  )}s`;

  const precisionPercentage = computePrecision(rounded, targetTime);
  recordPrecision(precisionPercentage);
  const delta = getPrecisionDelta(precisionPercentage);
  updateDisplay(elapsed);

  timer.style.opacity = 1;
  timer.textContent = elapsed.toFixed(getDecimalCount()) + "s";

  let feedbackColor;
  let scored = false;

  if (precisionPercentage >= 100 - precisionMargin * 0.01) {
    feedbackColor = "#00e676";
    displayFeedback("Perfect!", feedbackColor);
    incrementStreak();
    scored = true;
  } else if (precisionPercentage >= 100 - precisionMargin * 0.2) {
    feedbackColor = "#67e535";
    displayFeedback("Good job!", feedbackColor);
    incrementStreak();
    scored = true;
  } else if (precisionPercentage >= 100 - precisionMargin) {
    feedbackColor = "#ffeb3b";
    displayFeedback("You can do better!", feedbackColor);
    triggerShake(timer);
    scored = true;
  } else {
    feedbackColor = "#ff5252";
    if (!isPerfectionMode()) {
      streakDisplay.style.color = feedbackColor;
      scoreDisplay.style.color = feedbackColor;
      precisionDisplay.style.color = feedbackColor;
      streakDisplay.style.textShadow = `0 0 4px ${feedbackColor}, 0 0 8px ${feedbackColor}`;
      scoreDisplay.style.textShadow = `0 0 4px ${feedbackColor}, 0 0 8px ${feedbackColor}`;
      precisionDisplay.style.textShadow = `0 0 4px ${feedbackColor}, 0 0 8px ${feedbackColor}`;
      displayFeedback("Missed!", feedbackColor);
      updateStreakUI(feedbackColor, false);
      updateScoreUI(false);
      triggerShake(timer);
      triggerShake(scoreDisplay);
      triggerShake(streakDisplay);
      differenceDisplay.hidden = true;
      gainDisplay.classList.add("hidden");
      setTimeout(() => {
        showEndScreen();
      }, 1500);
    } else {
      precisionDisplay.style.color = feedbackColor;
      precisionDisplay.style.textShadow = `0 0 4px ${feedbackColor}, 0 0 8px ${feedbackColor}`;
      differenceDisplay.hidden = true;
      displayFeedback("Missed!", feedbackColor);
      triggerShake(timer);
    }
  }

  if (!isPerfectionMode() && scored) {
    updateGain(computeScore(timeDeviation, getStreak()));
    updateScore(getGain());
    updateGainUI(feedbackColor, true);
    updatePrecisionDifferenceUI(delta, true);
  }
  updateStreakUI(feedbackColor, scored);
  updatePrecisionUI(feedbackColor, precisionPercentage, true);
}

/** Update UI colors and result message */
function displayFeedback(message, color) {
  applyFeedbackColor(timer, resultMsg, circle, color, message);
}

export function updatePrecisionDifferenceUI(delta, shouldAnimate) {
  let color = "#ffffff";
  differenceDisplay.hidden = false;
  if (Math.abs(delta) < 0.01) {
    differenceDisplay.textContent = ``;
    differenceDisplay.style.color = "#ffffff";
    differenceDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
  } else {
    color = delta >= 0 ? "#67e535" : "#ff5252";
    differenceDisplay.textContent = delta > 0 ? `+${delta}%` : `${delta}%`;
    differenceDisplay.style.color = color;
    differenceDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
  }
  if (shouldAnimate) {
    triggerFloatUp(differenceDisplay);
  }
}

export function updatePrecisionUI(feedbackColor, percentage, shouldAnimate) {
  precisionDisplay.textContent = `${percentage.toFixed(getDecimalCount())}%`;
  if (shouldAnimate) {
    precisionDisplay.style.color = feedbackColor;
    precisionDisplay.style.textShadow = `0 0 4px ${feedbackColor}, 0 0 8px ${feedbackColor}`;
    triggerPulse(precisionDisplay);
  }
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
  gainDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
  if (shouldAnimate) {
    triggerGainAnimation(gainDisplay, () => updateScoreUI(shouldAnimate));
  }
}

/** Reset only the current round state (UI + timer logic) */
export function resetRoundUI() {
  console.log("[INFO] Round reset");
  if (isPerfectionMode()) {
    scoreDisplay.style.display = "none";
    streakDisplay.style.display = "none";
    gainDisplay.style.display = "none";
    differenceDisplay.hidden = true;
  } else {
    scoreDisplay.style.display = "block";
    streakDisplay.style.display = "block";
    gainDisplay.style.display = "block";
    differenceDisplay.hidden = false;
  }

  // Core logic reset
  reset();

  // Timer display
  timer.textContent = "0.00s";
  timer.style.color = "#ffffff";
  timer.style.textShadow = `0 0 6px #ffffff, 0 0 12px #ffffff`;
  target.textContent = getTargetTime().toFixed(getDecimalCount());

  // UI text & button
  resultMsg.textContent = "";
  diffMsg.textContent = "";
  button.textContent = "START";
  button.classList.remove("stop", "restart");

  // UI states cleanup
  scoreDisplay.classList.remove("pulse");
  streakDisplay.classList.remove("pulse", "roll-up");
  gainDisplay.classList.remove("animate");
  gainDisplay.classList.add("hidden");

  // Reset text colors
  precisionDisplay.style.color = "#ffffff";
  precisionDisplay.style.textShadow = `0 0 4px #ffffff, 0 0 8px #ffffff`;
  streakDisplay.style.color = "#ffffff";
  streakDisplay.style.textShadow = `0 0 4px #ffffff, 0 0 8px #ffffff`;
  scoreDisplay.style.color = "#ffffff";
  scoreDisplay.style.textShadow = `0 0 4px #ffffff, 0 0 8px #ffffff`;

  differenceDisplay.hidden = true;
  previousDirection = 1;

  // Circular progress reset
  const circleMargin = getCircleMargin();
  setCircleVisibility();
  circle.setAttribute("stroke", "#ffffff");
  circleOffsetBias = Math.min(
    Math.max((Math.random() * 2 - 1) * circleMargin, -circleMargin),
    circleMargin
  );
  setProgress(0);

  // Update static score display
  updateScoreUI(false);
}

/** Fully reset the game session (UI + core state) */
export function resetGameUI() {
  console.log("[INFO] Game session reset");

  modeTitle.textContent = getMode();
  // Reset core game stats
  resetScore();
  resetStreak();
  resetGain();
  resetPrecisionHistory();

  // Reset round-specific UI
  resetRoundUI();

  // Reset feedback-related UI components
  updateStreakUI("#ffffff", false);
  updateScoreUI(false);
  updateGainUI("#ffffff", false);
  updatePrecisionUI("#ffffff", 0, false);
  updatePrecisionDifferenceUI(0, false);

  differenceDisplay.hidden = true;
}

/** Start or stop timer on button click */
export function setupTimerUI() {
  button.addEventListener("click", () => {
    if (!isTimerRunning()) {
      resetRoundUI();
      triggerPulse(targetTimeDisplay);
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

function showEndScreen() {
  if (isPerfectionMode()) return;
  console.log("[INFO] Game Over");
  document.getElementById("stat-precision").textContent = getAveragePrecision();
  document.getElementById("stat-score").textContent = getScore() + " PTS";
  document.getElementById("stat-avg-score").textContent =
    getAverageScore().toFixed(0) + " PTS";
  document.getElementById("stat-streak").textContent = getStreak();
  document.getElementById("stat-best-score").textContent =
    getMaxGain() + " PTS";

  showScreen("end-screen");

  newGameButton.addEventListener(
    "click",
    () => {
      resetGameUI();
      showScreen("game");
    },
    { once: true }
  );
}
