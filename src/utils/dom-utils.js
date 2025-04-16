/** Checks if an element is visible */
export function isVisible(element) {
  return !!element && window.getComputedStyle(element).display !== "none";
}
