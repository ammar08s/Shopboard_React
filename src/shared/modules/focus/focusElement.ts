/** Focuses a newly mounted confirmation without an effect or copied state.
 * @param element - Mounted focusable element, or null after unmounting.
 * @returns Nothing; updates browser keyboard focus only when the element is mounted.
 */
export function focusElement(element: HTMLElement | null): void {
  element?.focus();
}
