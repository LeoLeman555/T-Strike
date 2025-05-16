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
  startInfiniteParticleRain,
  stopInfiniteParticleRain,
} from "../utils/animations.js";

import { showScreen } from "./navigation-ui.js";
import { getMode } from "../core/mode-core.js";

// UI Elements
const modeTitle = document.querySelector("#mode-title");
const timer = document.querySelector("#timer");
const button = document.querySelector("#start-stop-btn");
const newGameButton = document.querySelector("#btn-restart");
const resultMsg = document.querySelector("#result-msg");
const diffMsg = document.querySelector("#time-difference-msg");
const streakDisplay = document.querySelector("#current-streak");
const scoreDisplay = document.querySelector("#current-score");
const precisionDisplay = document.querySelector("#current-precision");
export const differenceDisplay = document.querySelector(
  "#precision-difference"
);
const gainDisplay = document.querySelector("#score-gain");
const target = document.querySelector("#target");
const targetTimeDisplay = document.querySelector(".target-time");
const circle = document.querySelector(".progress-ring-circle");
const congratsMsg = document.querySelector("#congrats-msg");

const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
let circleOffsetBias = 0;
let previousDirection = 1; // 1 = normal, -1 = reverse

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = `${circumference}`;
updateDisplay(0);

/** Return true if mode is 'Perfection' */
function isPerfectionMode() {
  return getMode() === "Perfection";
}

/**
 * Update the circular progress bar
 * @param {number} progress - Ratio of progress (0 to 1)
 */
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

/**
 * Ensure the progress circle is visible
 */
function setCircleVisibility() {
  if (!getCircleVisibility()) {
    animateCircleVisibility(circle);
  } else {
    circle.classList.remove("circle-fade-out");
    circle.style.display = "block";
    circle.style.opacity = 1;
  }
}

/**
 * Update the on-screen timer, progress, and style
 * @param {number} elapsed - Elapsed time
 */
function updateDisplay(elapsed) {
  const chronoVisible = isChronoVisible();
  if (chronoVisible) {
    timer.textContent = elapsed.toFixed(getDecimalCount()) + "s";
    timer.style.opacity = 1;
  } else {
    timer.style.opacity = 0;
  }

  const currentDirection = Math.sign(!isChronoInvertedActive());
  if (currentDirection !== previousDirection) {
    triggerDirectionFlip(timer);
    previousDirection = currentDirection;
  }

  setProgress(elapsed / getTargetTime());
  target.textContent = getTargetTime().toFixed(getDecimalCount());

  // UI consistent white glow
  [streakDisplay, scoreDisplay, precisionDisplay].forEach((el) => {
    el.style.color = "#ffffff";
    el.style.textShadow = "0 0 5px #ffffff, 0 0 10px #ffffff";
  });
}

/**
 * Display the feedback based on elapsed time
 * @param {number} elapsed - Elapsed time when stopped
 */
function showResult(elapsed) {
  const targetTime = getTargetTime();
  const rounded = Number(elapsed.toFixed(getDecimalCount()));
  const timeDeviation = Math.abs(rounded - targetTime);
  const precisionPercentage = computePrecision(rounded, targetTime);
  const delta = getPrecisionDelta(precisionPercentage);

  recordPrecision(precisionPercentage);
  diffMsg.textContent = `Difference: ${timeDeviation.toFixed(
    getDecimalCount()
  )}s`;
  updateDisplay(elapsed);

  timer.textContent = elapsed.toFixed(getDecimalCount()) + "s";
  timer.style.opacity = 1;

  let feedbackColor;
  let scored = false;

  if (precisionPercentage >= 100 - getPrecisionMargin() * 0.01) {
    feedbackColor = "#00e676";
    displayFeedback("PERFECT!", feedbackColor);
    incrementStreak();
    scored = true;
    if (isPerfectionMode()) {
      precisionDisplay.classList.add("perfection-pulse");
      startInfiniteParticleRain();
      button.classList.add("hidden");
      congratsMsg.classList.remove("hidden");
      congratsMsg.classList.add("visible");
    }
  } else if (precisionPercentage >= 100 - getPrecisionMargin() * 0.2) {
    feedbackColor = "#67e535";
    displayFeedback("GOOD JOB!", feedbackColor);
    incrementStreak();
    scored = true;
  } else if (precisionPercentage >= 100 - getPrecisionMargin()) {
    feedbackColor = "#ffeb3b";
    displayFeedback("YOU CAN DO BETTER!", feedbackColor);
    triggerShake(timer);
    scored = true;
  } else {
    feedbackColor = "#ff5252";
    handleMissedAttempt(feedbackColor);
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

/**
 * Apply failure UI effects and transitions
 * @param {string} color - Color hex for error state
 */
function handleMissedAttempt(color) {
  if (!isPerfectionMode()) {
    [streakDisplay, scoreDisplay, precisionDisplay].forEach((el) => {
      el.style.color = color;
      el.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
    });
    displayFeedback("MISSED!", color);
    updateStreakUI(color, false);
    updateScoreUI(false);
    triggerShake(timer);
    triggerShake(scoreDisplay);
    triggerShake(streakDisplay);
    differenceDisplay.hidden = true;
    gainDisplay.classList.add("hidden");
    setTimeout(showEndScreen, 1500);
  } else {
    precisionDisplay.style.color = color;
    precisionDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
    displayFeedback("MISSED!", color);
    triggerShake(timer);
    differenceDisplay.hidden = true;
  }
}

/**
 * Display feedback message with visual cues
 * @param {string} message - Message to show
 * @param {string} color - Color to apply
 */
function displayFeedback(message, color) {
  applyFeedbackColor(timer, resultMsg, circle, color, message);
}

/**
 * Update precision difference with animation
 */
export function updatePrecisionDifferenceUI(delta, shouldAnimate) {
  differenceDisplay.hidden = false;
  let color = "#ffffff";

  if (Math.abs(delta) < 0.01) {
    differenceDisplay.textContent = "";
  } else {
    color = delta >= 0 ? "#67e535" : "#ff5252";
    differenceDisplay.textContent = delta > 0 ? `+${delta}%` : `${delta}%`;
  }

  differenceDisplay.style.color = color;
  differenceDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
  if (shouldAnimate) triggerFloatUp(differenceDisplay);
}

/**
 * Update displayed precision value
 */
export function updatePrecisionUI(color, percentage, shouldAnimate) {
  precisionDisplay.textContent = `${percentage.toFixed(getDecimalCount())}%`;
  if (shouldAnimate) {
    precisionDisplay.style.color = color;
    precisionDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
    triggerPulse(precisionDisplay);
  }
}

/** Update streak count visually */
export function updateStreakUI(color, shouldAnimate) {
  streakDisplay.classList.remove("roll-up", "pulse");
  void streakDisplay.offsetWidth; // Force reflow
  if (shouldAnimate) {
    triggerRollUp(
      streakDisplay,
      () => {
        streakDisplay.textContent = getStreak();
      },
      () => {
        triggerPulse(streakDisplay);
        updateGainUI(color, true);
      },
      250
    );
  } else {
    streakDisplay.textContent = getStreak();
  }
}

/** Update score visually */
export function updateScoreUI(shouldAnimate) {
  scoreDisplay.textContent = getScore();
  if (shouldAnimate) triggerPulse(scoreDisplay);
}

/** Update score gain text with animation */
export function updateGainUI(color, shouldAnimate) {
  gainDisplay.textContent = `+${getGain()}`;
  gainDisplay.style.color = color;
  gainDisplay.style.textShadow = `0 0 4px ${color}, 0 0 8px ${color}`;
  if (shouldAnimate)
    triggerGainAnimation(gainDisplay, () => updateScoreUI(true));
}

/** Reset UI and timer for new round */
export function resetRoundUI() {
  console.log("[INFO] Round reset");
  const isPerf = isPerfectionMode();

  reset();
  stopInfiniteParticleRain();

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
  precisionDisplay.classList.remove("perfection-pulse");

  scoreDisplay.style.display = isPerf ? "none" : "block";
  streakDisplay.style.display = isPerf ? "none" : "block";
  gainDisplay.style.display = isPerf ? "none" : "block";

  [precisionDisplay, streakDisplay, scoreDisplay].forEach((el) => {
    el.style.color = "#ffffff";
    el.style.textShadow = `0 0 4px #ffffff, 0 0 8px #ffffff`;
  });
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

/** Reset full UI and game state */
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

  button.classList.remove("hidden");
  congratsMsg.classList.remove("visible");
  congratsMsg.classList.add("hidden");

  // Reset feedback-related UI components
  updateStreakUI("#ffffff", false);
  updateScoreUI(false);
  updateGainUI("#ffffff", false);
  updatePrecisionUI("#ffffff", 0, false);
  updatePrecisionDifferenceUI(0, false);

  differenceDisplay.hidden = true;
}

/** Attach game timer to start/stop logic */
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

/** Display end game stats and show end screen */
function showEndScreen() {
  if (isPerfectionMode()) return;
  console.log("[INFO] Game Over");

  document.querySelector("#stat-precision").textContent = getAveragePrecision();
  document.querySelector("#stat-score").textContent = getScore() + " PTS";
  document.querySelector("#stat-avg-score").textContent =
    getAverageScore().toFixed(0) + " PTS";
  document.querySelector("#stat-streak").textContent = getStreak();
  document.querySelector("#stat-best-score").textContent =
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
