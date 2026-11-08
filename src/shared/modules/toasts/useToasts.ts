import { useCallback, useReducer, useRef } from 'react';
import { notificationReducer } from './toasts.reducer.ts';
import type { Notify, ToastInput, ToastState } from './toasts.types.ts';

interface ToastController extends ToastState {
  notify: Notify;
  dismiss: (id: number) => void;
}

/** Owns the bounded notification queue and stable actions shared by application features. No inputs.
 * @returns Visible notifications, an action to publish feedback, and an ID-specific dismissal action.
 */
export function useToasts(): ToastController {
  const [state, dispatch] = useReducer(notificationReducer, { toasts: [], announcement: null });
  const nextId = useRef(0);
  const notify = useCallback(
    /** Publishes an action outcome using a distinct ID.
     * @param notification - Message, severity, and optional navigation action.
     * @returns Nothing; updates notification state without moving keyboard focus.
     */
    function notify(notification: ToastInput): void {
      nextId.current += 1;
      dispatch({ type: 'show', toast: { ...notification, id: nextId.current } });
    },
    [],
  );
  const dismiss = useCallback(
    /** Removes only the requested notification.
     * @param id - Notification ID to remove.
     * @returns Nothing; updates notification state.
     */
    function dismiss(id: number): void {
      dispatch({ type: 'dismiss', id });
    },
    [],
  );
  return { ...state, notify, dismiss };
}
