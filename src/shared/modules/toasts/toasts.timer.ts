import type { ToastMessage } from './toasts.types.ts';

const TOAST_DURATION_MS = 6000;

/** Starts automatic dismissal for a temporary notification; errors remain until dismissed.
 * @param toast - Notification whose lifetime is being synchronized.
 * @param onDismiss - Callback receiving the expired notification ID.
 * @returns Cleanup that cancels any scheduled dismissal when paused, replaced, or unmounted.
 */
export function startToastTimer(toast: ToastMessage, onDismiss: (id: number) => void): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  /** Dismisses this notification after its reading time. No inputs.
   * @returns Nothing; invokes the supplied dismissal callback with this notification's ID.
   */
  function expire(): void {
    onDismiss(toast.id);
  }
  if (toast.variant !== 'error') timeout = setTimeout(expire, TOAST_DURATION_MS);
  /** Cancels a pending dismissal. No inputs.
   * @returns Nothing; clears the timer when one was created.
   */
  function cleanup(): void {
    if (timeout !== undefined) clearTimeout(timeout);
  }
  return cleanup;
}
