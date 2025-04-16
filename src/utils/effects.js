/** Triggers a shake effect on the target DOM element */
export function triggerShake(element) {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), 400);
}
