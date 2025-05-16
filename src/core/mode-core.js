const modes = ["Perfection", "Endless", "Multiplayer"];
let currentModeIndex = 0;
let mode = null;

/** Return the name of the current mode based on index */
export function getCurrentMode() {
  return modes[currentModeIndex];
}

/**
 * Shift the current mode index by the given direction.
 * @param {number} direction - Direction to shift (1 = next, -1 = previous).
 * @returns {string} The new current mode.
 */
export function shiftMode(direction = 1) {
  const total = modes.length;
  currentModeIndex = (currentModeIndex + direction + total) % total;
  return getCurrentMode();
}

/**
 * Return the previous, current, and next modes.
 * @returns {{prev: string, current: string, next: string}} Mode triplet.
 */
export function getAdjacentModes() {
  const total = modes.length;
  const prev = (currentModeIndex - 1 + total) % total;
  const next = (currentModeIndex + 1) % total;
  return {
    prev: modes[prev],
    current: modes[currentModeIndex],
    next: modes[next],
  };
}

/** Return the selected game mode (independent of index) */
export function getMode() {
  return mode;
}

/**
 * Update the selected game mode manually.
 * @param {string} newMode - New mode to assign.
 */
export function updateMode(newMode) {
  mode = newMode;
}
