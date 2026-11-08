import type { ReactElement } from 'react';
import type { ToastMessage } from '../../modules/toasts/toasts.types.ts';
import { Toast } from '../Toast/Toast.tsx';
import './ToastRegion.css';

interface Props {
  toasts: ToastMessage[];
  announcement: ToastMessage | null;
  onDismiss: (id: number) => void;
}

/** Keeps action notifications in a consistent viewport location across application pages.
 * @param props - Notification queue, latest announcement event, and dismissal callback.
 * @returns Persistent polite/assertive announcement regions and newest-first keyed Toast components.
 */
export function ToastRegion({ toasts, announcement, onDismiss }: Props): ReactElement {
  /** Renders a notification with stable identity for timers and dismissal.
   * @param toast - Queued notification.
   * @returns A keyed Toast component.
   */
  function renderToast(toast: ToastMessage): ReactElement {
    return <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />;
  }
  return (
    <section className="ui-toast-region" aria-label="Notifications">
      <div className="ui-toast-announcement" role="status" aria-atomic="true">
        {announcement !== null && announcement.variant !== 'error' ? (
          <span key={announcement.id}>{announcement.message}</span>
        ) : null}
      </div>
      <div className="ui-toast-announcement" role="alert" aria-atomic="true">
        {announcement?.variant === 'error' ? (
          <span key={announcement.id}>{announcement.message}</span>
        ) : null}
      </div>
      <ol>{toasts.toReversed().map(renderToast)}</ol>
    </section>
  );
}
