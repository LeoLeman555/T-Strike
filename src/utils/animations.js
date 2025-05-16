/**
 * Triggers a shake effect on the target DOM element.
 * @param {HTMLElement} element - The DOM element to shake.
 */
export function triggerShake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 400);
}

/**
 * Triggers a pulse animation on the target DOM element.
 * @param {HTMLElement} element - The DOM element to animate.
 */
export function triggerPulse(element) {
  element.classList.add("pulse");
  element.addEventListener(
    "animationend",
    () => {
      element.classList.remove("pulse");
    },
    { once: true }
  );
}

/**
 * Triggers a roll-up animation on the target DOM element.
 * @param {HTMLElement} element - The element to animate.
 * @param {Function} midAction - Function to call during the animation.
 * @param {Function} onComplete - Function to call after animation ends.
 * @param {number} [midActionDelay=250] - Delay before executing midAction (ms).
 */
export function triggerRollUp(
  element,
  midAction,
  onComplete,
  midActionDelay = 250
) {
  element.classList.add("roll-up");

  if (typeof midAction === "function") {
    setTimeout(() => midAction(), midActionDelay);
  }

  element.addEventListener(
    "animationend",
    (e) => {
      if (e.animationName === "roll-up") {
        element.classList.remove("roll-up");
        if (typeof onComplete === "function") {
          onComplete();
        }
      }
    },
    { once: true }
  );
}

/**
 * Triggers a temporary gain animation and hides the element afterward.
 * @param {HTMLElement} element - The DOM element to animate.
 * @param {Function} onComplete - Callback executed after the animation ends.
 */
export function triggerGainAnimation(element, onComplete) {
  element.classList.remove("hidden");
  void element.offsetWidth; // Force reflow
  element.classList.add("animate");

  element.addEventListener(
    "transitionend",
    () => {
      element.classList.remove("animate");
      element.classList.add("hidden");
      if (typeof onComplete === "function") {
        onComplete();
      }
    },
    { once: true }
  );
}

/**
 * Applies feedback color styling to key UI elements.
 * @param {HTMLElement} timerElement - Element showing the timer.
 * @param {HTMLElement} resultMsgElement - Element showing the result message.
 * @param {SVGElement} circleElement - SVG circle representing a timer/progress.
 * @param {string} color - The color to apply.
 * @param {string} message - Feedback message to display.
 */
export function applyFeedbackColor(
  timerElement,
  resultMsgElement,
  circleElement,
  color,
  message
) {
  resultMsgElement.textContent = message;
  resultMsgElement.style.color = color;
  resultMsgElement.style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}`;
  timerElement.style.color = color;
  timerElement.style.textShadow = `0 0 5px ${color}, 0 0 10px ${color}`;
  circleElement.setAttribute("stroke", color);
}

/**
 * Fades out a circular visual element and hides it after animation.
 * @param {HTMLElement} element - The circle DOM element to animate.
 */
export function animateCircleVisibility(element) {
  element.classList.remove("circle-fade-out");
  void element.offsetWidth;
  element.classList.add("circle-fade-out");
  setTimeout(() => {
    element.style.display = "none";
  }, 3000);
}

/**
 * Triggers a direction-change flip animation.
 * @param {HTMLElement} element - The DOM element to animate.
 */
export function triggerDirectionFlip(element) {
  element.classList.remove("direction-change");
  void element.offsetWidth;
  element.classList.add("direction-change");
}

/**
 * Triggers a float-up animation for temporary visual feedback.
 * @param {HTMLElement} element - The DOM element to animate.
 */
export function triggerFloatUp(element) {
  element.hidden = false;
  element.classList.remove("float-up");
  void element.offsetWidth;
  element.classList.add("float-up");

  setTimeout(() => {
    element.classList.remove("float-up");
    element.hidden = true;
  }, 800);
}

// --- Particle Rain System ---

let rainContainer = null;

/**
 * Starts an infinite falling particle rain animation on the screen.
 */
export function startInfiniteParticleRain() {
  if (!rainContainer) rainContainer = createParticleContainer();

  const PARTICLE_COUNT = 100;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const size = Math.random() * 5 + 6;
    const left = Math.random() * 100;
    const duration = Math.random() * 5 + 4;
    const delay = Math.random() * 6;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animation = `fall ${duration}s linear ${delay}s infinite`;

    rainContainer.appendChild(particle);
  }
}

/**
 * Stops the infinite falling particle rain animation.
 */
export function stopInfiniteParticleRain() {
  if (rainContainer) {
    rainContainer.remove();
    rainContainer = null;
  }
}

/**
 * Creates and returns a container for particles.
 * @returns {HTMLElement} - The newly created container element.
 */
function createParticleContainer() {
  const container = document.createElement("div");
  container.id = "particle-rain";
  document.body.appendChild(container);
  return container;
}
