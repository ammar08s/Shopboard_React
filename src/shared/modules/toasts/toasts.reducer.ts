import type { ToastAction, ToastMessage, ToastState } from './toasts.types.ts';

const MAX_TOASTS = 3;

/** Applies notification actions without mutating the current queue.
 * @param toasts - Current notifications in arrival order.
 * @param action - Notification to show or ID to dismiss.
 * @returns The latest three messages, replacing identical earlier messages and ignoring blank text.
 */
export function toastReducer(toasts: ToastMessage[], action: ToastAction): ToastMessage[] {
  if (action.type === 'dismiss') {
    const dismissedId = action.id;
    /** Keeps notifications other than the requested ID.
     * @param toast - Queued notification.
     * @returns Whether it should remain visible.
     */
    function keepToast(toast: ToastMessage): boolean {
      return toast.id !== dismissedId;
    }
    return toasts.filter(keepToast);
  }
  if (action.toast.message.trim() === '') return toasts;
  const nextToast = action.toast;
  /** Removes a repeated message before its replacement is appended.
   * @param toast - Queued notification.
   * @returns Whether its message and variant differ from the incoming notification.
   */
  function differentMessage(toast: ToastMessage): boolean {
    return toast.message !== nextToast.message || toast.variant !== nextToast.variant;
  }
  return [...toasts.filter(differentMessage), nextToast].slice(-MAX_TOASTS);
}

/** Coordinates visible notification history and the current announcement event.
 * @param state - Queue and most recent announcement.
 * @param action - Notification show/dismiss action.
 * @returns Updated queue and announcement without reviving older announcements.
 */
export function notificationReducer(state: ToastState, action: ToastAction): ToastState {
  const toasts = toastReducer(state.toasts, action);
  if (action.type === 'show') {
    if (action.toast.message.trim() === '') return state;
    return { toasts, announcement: action.toast };
  }
  const announcement = state.announcement?.id === action.id ? null : state.announcement;
  return { toasts, announcement };
}
