import type { ReactElement } from 'react';
import './PageLoadError.css';

// This fallback accepts any page's prop object and intentionally reads none of it.
interface Props {}

/** Provides a recovery action when a requested page module cannot be downloaded.
 * @param _props - Ignored props forwarded from whichever page failed to load.
 * @returns An accessible route error and an explicit reload action.
 */
export function PageLoadError(_props: Props): ReactElement {
  /** Retries with the current page and asset references. No inputs.
   * @returns Nothing; reloads the browser only after the user requests it.
   */
  function reloadPage(): void {
    window.location.reload();
  }

  return (
    <section className="store-page-error" role="alert">
      <h1>This page could not be loaded</h1>
      <p>Check your connection and reload the page to try again.</p>
      <button type="button" onClick={reloadPage}>
        Reload page
      </button>
    </section>
  );
}
