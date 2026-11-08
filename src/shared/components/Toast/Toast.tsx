import { useEffect, useState } from 'react';
import type { FocusEvent, ReactElement } from 'react';
import { startToastTimer } from '../../modules/toasts/toasts.timer.ts';
import type { ToastMessage, ToastVariant } from '../../modules/toasts/toasts.types.ts';
import './Toast.css';

interface Props {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const variantLabels: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Notice',
};

/** Displays one accessible action notification with dismiss controls and a paused reading timer.
 * @param props - Notification content and its ID-specific dismissal callback.
 * @returns A notification list item; success/info expire and errors remain until dismissed.
 */
export function Toast({ toast, onDismiss }: Props): ReactElement {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const messageId = `ui-toast-message-${toast.id}`;

  /** Synchronizes this notification's timer with its content and interaction state. No inputs.
   * @returns Timer cleanup, or nothing while the notification is being read through hover/focus.
   */
  function synchronizeTimer(): (() => void) | undefined {
    if (isHovered || hasFocus) return;
    return startToastTimer(toast, onDismiss);
  }
  useEffect(synchronizeTimer, [toast, onDismiss, isHovered, hasFocus]);

  /** Dismisses this message without affecting other notifications. No inputs.
   * @returns Nothing; invokes the dismissal callback.
   */
  function dismissToast(): void {
    onDismiss(toast.id);
  }
  /** Pauses automatic dismissal while the pointer is over this message. No inputs.
   * @returns Nothing; updates hover state.
   */
  function pauseForPointer(): void {
    setIsHovered(true);
  }
  /** Restarts reading time when the pointer leaves. No inputs.
   * @returns Nothing; updates hover state.
   */
  function resumeForPointer(): void {
    setIsHovered(false);
  }
  /** Pauses automatic dismissal while a notification control has keyboard focus. No inputs.
   * @returns Nothing; updates focus state.
   */
  function pauseForFocus(): void {
    setHasFocus(true);
  }
  /** Resumes dismissal after focus leaves the complete notification.
   * @param event - Focus movement from a notification control.
   * @returns Nothing; keeps the pause while focus remains inside this notification.
   */
  function resumeForFocus(event: FocusEvent<HTMLLIElement>): void {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
      return;
    setHasFocus(false);
  }

  return (
    <li
      className={`ui-toast ui-toast-${toast.variant}`}
      onPointerEnter={pauseForPointer}
      onPointerLeave={resumeForPointer}
      onFocus={pauseForFocus}
      onBlur={resumeForFocus}
    >
      <div className="ui-toast-content">
        <strong>{variantLabels[toast.variant]}</strong>
        <p id={messageId}>{toast.message}</p>
      </div>
      {toast.action !== undefined ? (
        <a className="ui-toast-action" href={toast.action.href}>
          {toast.action.label}
        </a>
      ) : null}
      <button
        className="ui-toast-dismiss"
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss notification"
        aria-describedby={messageId}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}
