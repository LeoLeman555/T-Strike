/** Triggers a shake effect on the target DOM element */
export function triggerShake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 400);
}

/** Triggers a pulse animation on the target DOM element */
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
 * Triggers a roll-up animation on the target DOM element,
 * executes a mid-animation action after a delay,
 * then calls the onComplete function after animation ends.
 */
export function triggerRollUp(
  element,
  midAction,
  onComplete,
  midActionDelay = 250
) {
  element.classList.add("roll-up");
  if (typeof midAction === "function") {
    setTimeout(() => {
      midAction();
    }, midActionDelay);
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

/** Triggers a score gain animation on the target DOM element */
export function triggerGainAnimation(element, onComplete) {
  element.classList.remove("hidden");
  void element.offsetWidth;
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

/** Updates visual feedback colors on multiple elements */
export function applyFeedbackColor(
  timerElement,
  resultMsgElement,
  circleElement,
  color,
  message
) {
  resultMsgElement.textContent = message;
  resultMsgElement.style.color = color;
  timerElement.style.color = color;
  circleElement.setAttribute("stroke", color);
}

export function animateCircleVisibility(element) {
  element.classList.remove("circle-fade-out");
  void element.offsetWidth;
  element.classList.add("circle-fade-out");
  setTimeout(() => {
    element.style.display = "none";
  }, 3000);
}

export function triggerDirectionFlip(element) {
  element.classList.remove("direction-change");
  void element.offsetWidth;
  element.classList.add("direction-change");
}

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
