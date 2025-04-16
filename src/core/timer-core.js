const precision = 3;
const targetTime = 5.0;

let isRunning = false;
let startTime = 0;
let animationFrameId = null;

let currentStreak = 0;

/** Start the timer and updates state */
export function start(onUpdate) {
  isRunning = true;
  startTime = performance.now();
  animationFrameId = requestAnimationFrame(function update() {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;
    onUpdate(elapsed);
    animationFrameId = requestAnimationFrame(update);
  });
}

/** Stop the timer and returns elapsed time */
export function stop() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  return (performance.now() - startTime) / 1000;
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

/** Precision to use for display */
export function getPrecision() {
  return precision;
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
