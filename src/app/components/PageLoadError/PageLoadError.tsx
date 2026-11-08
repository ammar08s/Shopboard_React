import type { ReactElement } from 'react';
import './PageLoadError.css';

interface Props {
  resetErrorBoundary: () => void;
}

/** Provides a recovery action when a requested page module cannot be downloaded.
 * @param props - Error Boundary reset action for the failed page.
 * @returns An accessible route error, retry action, and full reload recovery option.
 */
export function PageLoadError({ resetErrorBoundary }: Props): ReactElement {
  /** Retries with the current page and asset references. No inputs.
   * @returns Nothing; reloads the browser only after the user requests it.
   */
  function reloadPage(): void {
    window.location.reload();
  }

  return (
    <section className="store-page-error" role="alert">
      <h1>This page could not be displayed</h1>
      <p>Try the page again. If the app has been updated, reload to get the latest version.</p>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>{' '}
      <button type="button" onClick={reloadPage}>
        Reload page
      </button>
    </section>
  );
}
