import {
  getEndlessParams,
  perfectionParams,
} from "../config/difficulty-config.js";
import { getMode } from "./mode-core.js";

let isRunning = false;
let startTime = 0;
let animationFrameId = null;

let currentElapsedTime = 0;
let lastFrameTime = 0;

let chronoSpeed = 1;
let decimalCount = 1;
let precisionMargin = 20;
let minTargetTime = 5;
let maxTargetTime = 5;
let targetTime = getRandomTarget();

let circleVisibility = true;
let circleMargin = 0;

let chronoVisibility = true;
let hideTimeoutId = null;
let chronoHideCycles = 0;
let minHideDuration = 0;
let maxHideDuration = 0;

let chronoRun = true;
let pauseTimeoutId = null;
let chronoPauseCycles = 0;
let minPauseDuration = 0;
let maxPauseDuration = 0;

let pauseTimeTotal = 0;
let pauseStartTime = 0;

let isChronoInverted = false;
let invertTimeoutId = null;
let chronoInvertCycles = 0;
let minInvertDuration = 0;
let maxInvertDuration = 0;

let currentScore = 0;
let scoreGain = 0;
let maxGain = 0;
let currentStreak = 0;
const precisionHistory = [];

/**
 * Start the main timer loop and updates elapsed time
 * @param {function} onUpdate - Callback to update display
 */
export function start(onUpdate) {
  isRunning = true;
  chronoRun = true;
  scheduleChronoHide();
  scheduleChronoPause();
  scheduleChronoInvert();

  currentElapsedTime = 0;
  pauseTimeTotal = 0;
  pauseStartTime = 0;
  startTime = performance.now();
  lastFrameTime = startTime;

  animationFrameId = requestAnimationFrame(function update() {
    const now = performance.now();

    if (chronoRun) {
      const deltaSeconds = (now - lastFrameTime) / 1000;
      const signedDelta =
        deltaSeconds * chronoSpeed * (isChronoInverted ? -1 : 1);
      currentElapsedTime += signedDelta;
      if (currentElapsedTime < 0) currentElapsedTime = 0;
      onUpdate(currentElapsedTime);
    }

    lastFrameTime = now;
    animationFrameId = requestAnimationFrame(update);
  });
}

/** Stop the timer and returns elapsed time */
export function stop() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  if (!chronoRun) {
    const now = performance.now();
    pauseTimeTotal += now - pauseStartTime;
  }
  return currentElapsedTime;
}

/** Reset all game timer states */
export function reset() {
  isRunning = false;
  pauseTimeTotal = 0;
  pauseStartTime = 0;
  chronoRun = true;
  cancelAnimationFrame(animationFrameId);
  clearTimeout(hideTimeoutId);
  clearTimeout(pauseTimeoutId);
  clearTimeout(invertTimeoutId);
  chronoVisibility = true;
  isChronoInverted = false;
  currentElapsedTime = 0;
  lastFrameTime = 0;
}
/**
 * Schedule a cycle to temporarily hide the chrono with randomized timing.
 */
function scheduleChronoHide() {
  if (chronoHideCycles <= 0) return;

  // Random duration for how long the chrono will stay hidden
  const delay =
    Math.random() * (maxHideDuration - minHideDuration) + minHideDuration;

  // Wait a random time before hiding the chrono
  hideTimeoutId = setTimeout(() => {
    chronoVisibility = false;

    // After 'delay', show chrono again and schedule next hide cycle
    setTimeout(() => {
      chronoVisibility = true;
      chronoHideCycles--;
      scheduleChronoHide();
    }, delay * 1000);
  }, Math.random() * 2000 + 500); // Random wait before hiding
}

/**
 * Schedule a pause in the chrono execution with randomized timing and duration.
 */
function scheduleChronoPause() {
  if (chronoPauseCycles <= 0) return;

  // Wait a random time before starting the pause
  const delay = Math.random() * 2000 + 500;

  pauseTimeoutId = setTimeout(() => {
    chronoRun = false;
    pauseStartTime = performance.now();

    // Random pause duration
    const pauseDuration =
      Math.random() * (maxPauseDuration - minPauseDuration) + minPauseDuration;

    // Resume chrono after the pause and track pause duration
    setTimeout(() => {
      const pauseEndTime = performance.now();
      pauseTimeTotal += pauseEndTime - pauseStartTime;
      chronoRun = true;
      chronoPauseCycles--;
      scheduleChronoPause();
    }, pauseDuration * 1000);
  }, delay);
}

/**
 * Schedule a temporary inversion of the chrono with randomized timing and duration.
 */
function scheduleChronoInvert() {
  if (chronoInvertCycles <= 0) return;

  // Wait a random time before inverting the chrono
  const delay = Math.random() * 2000 + 500;

  invertTimeoutId = setTimeout(() => {
    isChronoInverted = true;

    // Random inversion duration
    const invertDuration =
      Math.random() * (maxInvertDuration - minInvertDuration) +
      minInvertDuration;

    // Revert inversion after duration and schedule next cycle
    setTimeout(() => {
      isChronoInverted = false;
      chronoInvertCycles--;
      scheduleChronoInvert();
    }, invertDuration * 1000);
  }, delay);
}

/**
 * Apply settings from the selected game mode
 */
export function applyModeSettings() {
  let params = null;
  const mode = getMode();
  if (mode === "Endless") {
    params = getEndlessParams(getScore());
  } else if (mode === "Perfection") {
    params = perfectionParams;
  }

  if (!params) return;
  decimalCount = params.decimalCount;
  chronoSpeed = params.chronoSpeed;
  precisionMargin = params.precisionMargin;
  minTargetTime = params.minTargetTime;
  maxTargetTime = params.maxTargetTime;
  targetTime = getRandomTarget();
  circleVisibility = params.circleVisibility;
  chronoHideCycles = params.chronoHideCycles;
  minHideDuration = params.minHideDuration;
  maxHideDuration = params.maxHideDuration;
  chronoPauseCycles = params.chronoPauseCycles;
  minPauseDuration = params.minPauseDuration;
  maxPauseDuration = params.maxPauseDuration;
  chronoInvertCycles = params.chronoInvertCycles;
  minInvertDuration = params.minInvertDuration;
  maxInvertDuration = params.maxInvertDuration;
}

/**
 * Compute score based on precision difference and streak.
 * @param {number} timeError - Absolute time difference from target.
 * @param {number} streakCount - Current successful streak.
 * @returns {number} Score computed for this attempt.
 */
export function computeScore(timeError, streakCount) {
  if (timeError < 0 || streakCount < 0)
    throw new Error("Invalid input values.");

  let baseScore;
  if (timeError <= 0.015) {
    const normalizedError = timeError / 0.015;
    const smoothStep =
      normalizedError * normalizedError * (3 - 2 * normalizedError); // smoothstep interpolation
    baseScore = 150 + (500 - 150) * (1 - smoothStep);
  } else {
    baseScore = 150 * Math.exp(-5 * (timeError - 0.015));
  }

  const streakMultiplier = 1 + Math.log2(streakCount + 1) * 0.1;
  return Math.round(baseScore * streakMultiplier);
}

/**
 * Return the precision percentage based on the deviation from target.
 * @param {number} actualTime - The measured time.
 * @param {number} targetTime - The expected target time.
 * @returns {number} Precision percentage (0–100).
 */
export function computePrecision(actualTime, targetTime) {
  const deviation = Math.abs(actualTime - targetTime);
  const precision = 100 - (deviation / targetTime) * 100;
  return Math.max(0, Number(precision.toFixed(decimalCount)));
}

/**
 * Record a precision value in the history.
 * @param {number} value - Precision value to store.
 */
export function recordPrecision(value) {
  precisionHistory.push(value);
}

/**
 * Return the average of all recorded precision values.
 * @returns {number}
 */
export function getAveragePrecision() {
  if (precisionHistory.length === 0) return 0;
  const sum = precisionHistory.reduce((acc, val) => acc + val, 0);
  return Number((sum / precisionHistory.length).toFixed(decimalCount));
}

/**
 * Return the average score based on total score and recorded attempts.
 * @returns {number}
 */
export function getAverageScore() {
  if (precisionHistory.length === 0) return 0;
  return getScore() / precisionHistory.length;
}

/**
 * Return the delta between the current and average precision.
 * @param {number} current - Current precision value.
 * @returns {number}
 */
export function getPrecisionDelta(current) {
  if (precisionHistory.length < 2) return 0;
  const average = getAveragePrecision();
  return Number((current - average).toFixed(decimalCount));
}

/** Reset the precision history */
export function resetPrecisionHistory() {
  precisionHistory.length = 0;
}

/**
 * Add score to current total and update mode parameters accordingly.
 * @param {number} scoreToAdd - Score value to add.
 */
export function updateScore(scoreToAdd) {
  currentScore += scoreToAdd;
  applyModeSettings();
}

/** Return the current total score. */
export function getScore() {
  return currentScore;
}

/** Reset the current score to zero. */
export function resetScore() {
  currentScore = 0;
  applyModeSettings();
}

/** Return the last gain value. */
export function getGain() {
  return scoreGain;
}

/**
 * Update gain with the new score value.
 * @param {number} score - New gain value.
 */
export function updateGain(score) {
  scoreGain = score;
  if (scoreGain > maxGain) {
    maxGain = scoreGain;
  }
}

/** Return the maximum gain achieved. */
export function getMaxGain() {
  return maxGain;
}

/** Reset gain and max gain to zero. */
export function resetGain() {
  scoreGain = 0;
  maxGain = 0;
}

/** Return the current streak value. */
export function getStreak() {
  return currentStreak;
}

/** Increment the streak by one. */
export function incrementStreak() {
  currentStreak++;
}

/** Reset the streak to zero. */
export function resetStreak() {
  currentStreak = 0;
}

/** Return the current decimal count for precision display. */
export function getDecimalCount() {
  return decimalCount;
}

/** Increment the decimal count by one. */
export function incrementDecimalCount() {
  decimalCount++;
}

/** Reset decimal count to default. */
export function resetDecimalCount() {
  decimalCount = 1;
}

/** Return current chrono speed. */
export function getChronoSpeed() {
  return chronoSpeed;
}

/**
 * Set chrono speed to a new value.
 * @param {number} value - New chrono speed.
 */
export function updateChronoSpeed(value) {
  chronoSpeed = value;
}

/** Reset chrono speed to default. */
export function resetChronoSpeed() {
  chronoSpeed = 1;
}

/** Return current precision margin. */
export function getPrecisionMargin() {
  return precisionMargin;
}

/**
 * Set precision margin to a new value.
 * @param {number} value - New margin.
 */
export function updatePrecisionMargin(value) {
  precisionMargin = value;
}

/** Reset precision margin to default. */
export function resetPrecisionMargin() {
  precisionMargin = 20;
}

// Exports
export function isChronoVisible() {
  return chronoVisibility;
}
export function isChronoInvertedActive() {
  return isChronoInverted;
}
export function isTimerRunning() {
  return isRunning;
}
export function getTargetTime() {
  return targetTime;
}
export function getRandomTarget() {
  return Math.random() * (maxTargetTime - minTargetTime) + minTargetTime;
}
export function getCircleVisibility() {
  return circleVisibility;
}
export function getCircleMargin() {
  return circleMargin;
}
