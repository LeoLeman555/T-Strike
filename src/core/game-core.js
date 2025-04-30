const targetTime = 5.0;

let isRunning = false;
let startTime = 0;
let animationFrameId = null;

let currentStreak = 0;
let currentScore = 0;
let scoreGain = 0;

let chronoSpeed = 1;
let precisionMargin = 10;
let decimalCount = 3;

/** Start the timer and updates state */
export function start(onUpdate) {
  isRunning = true;
  startTime = performance.now();
  animationFrameId = requestAnimationFrame(function update() {
    const now = performance.now();
    const elapsed = ((now - startTime) / 1000) * chronoSpeed;
    onUpdate(elapsed);
    animationFrameId = requestAnimationFrame(update);
  });
}

/** Stop the timer and returns elapsed time */
export function stop() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  return ((performance.now() - startTime) / 1000) * chronoSpeed;
}

/** Reset internal state */
export function reset() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
}

/** Return whether the timer is running */
export function isTimerRunning() {
  return isRunning;
}

/** Target time for the game */
export function getTargetTime() {
  return targetTime;
}

/**
 * Compute score based on streak and precision.
 * @param {number} diff - Absolute time difference from target.
 * @param {number} streak - Current successful streak.
 * @returns {number} Computed score for the round.
 */
export function computeScore(diff, streak) {
  if (diff < 0 || streak < 0) throw new Error("Invalid input values.");

  let base;
  if (diff <= 0.015) {
    // Smoothstep from 500 to 150 between 0 and 0.015s
    const t = diff / 0.015;
    const smooth = t * t * (3 - 2 * t); // smoothstep
    base = 150 + (500 - 150) * (1 - smooth);
  } else {
    // Exponential decay from 150
    base = 150 * Math.exp(-5 * (diff - 0.015));
  }

  const multiplier = 1 + Math.log2(streak + 1) * 0.1;
  return Math.round(base * multiplier);
}

/**
 * Update the player's score by adding the given value.
 * @param {number} scoreToAdd - The value to add to the current score.
 */
export function updateScore(scoreToAdd) {
  currentScore += scoreToAdd;
}

/** Return current score of the player. */
export function getScore() {
  return currentScore;
}

/** Reset the player score to zero. */
export function resetScore() {
  currentScore = 0;
}

/** Return current gain of the player. */
export function getGain() {
  return scoreGain;
}

/**
 * Update the gain with a new score value.
 * @param {number} score - The new gain value.
 */
export function updateGain(score) {
  scoreGain = score;
}

/** Reset the gain value to zero. */
export function resetGain() {
  scoreGain = 0;
}

/** Return current streak count */
export function getStreak() {
  return currentStreak;
}

/** Increment streak by 1 */
export function incrementStreak() {
  currentStreak++;
}

/** Reset the streak to zero */
export function resetStreak() {
  currentStreak = 0;
}

/** Return the current decimal count */
export function getDecimalCount() {
  return decimalCount;
}

/** Increment the decimal count by 1 */
export function incrementDecimalCount() {
  decimalCount++;
}

/** Reset the decimal count to its default value. */
export function resetDecimalCount() {
  decimalCount = 1;
}

/** Return current chrono speed */
export function getChronoSpeed() {
  return chronoSpeed;
}

/**
 * Update the chrono speed with a new value.
 * @param {number} value - The new value.
 */
export function updateChronoSpeed(value) {
  chronoSpeed = value;
}

/** Resets the chrono speed to its default value. */
export function resetChronoSpeed() {
  chronoSpeed = 1;
}

/** Return current precision margin */
export function getPrecisionMargin() {
  return precisionMargin;
}

/**
 * Update the precision margin with a new value.
 * @param {number} value - The new value.
 */
export function updatePrecisionMargin(value) {
  precisionMargin = value;
}

/** Reset the precision margin to its default value. */
export function resetPrecisionMargin() {
  precisionMargin = 10.0;
}
