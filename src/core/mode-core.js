const modes = ["Perfection", "Endless", "Multiplayer"];
let currentModeIndex = 0;
let mode = null;

export function getCurrentMode() {
  return modes[currentModeIndex];
}

export function shiftMode(direction = 1) {
  const total = modes.length;
  currentModeIndex = (currentModeIndex + direction + total) % total;
  return getCurrentMode();
}

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

export function getMode() {
  return mode;
}

export function updateMode(newMode) {
  mode = newMode;
}
