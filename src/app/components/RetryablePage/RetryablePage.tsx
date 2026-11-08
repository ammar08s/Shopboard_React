import { lazy, Suspense, useState } from 'react';
import type { ComponentType, LazyExoticComponent, ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PageLoadError } from '../PageLoadError/PageLoadError.tsx';

interface Props<PageProps extends object> {
  load: () => Promise<{ default: ComponentType<PageProps> }>;
  pageProps: PageProps;
}

/** Loads one page and recreates its lazy identity only when the user explicitly retries.
 * @param props - Module-scope page loader and the current page props.
 * @returns Local page loading/recovery UI while persistent shell state stays mounted.
 */
export function RetryablePage<PageProps extends object>({
  load,
  pageProps,
}: Props<PageProps>): ReactElement {
  /** Creates an unloaded page identity without starting a request during render. No inputs.
   * @returns A lazy component whose rejected import is allowed to reach the Error Boundary.
   */
  function createPage(): LazyExoticComponent<ComponentType<PageProps>> {
    return lazy(load);
  }
  const [Page, setPage] = useState(createPage);
  /** Discards React.lazy's cached rejection after a deliberate retry. No inputs.
   * @returns Nothing; remounts the route with a fresh lazy identity.
   */
  function retryPage(): void {
    setPage(createPage);
  }
  return (
    <ErrorBoundary FallbackComponent={PageLoadError} onReset={retryPage}>
      <Suspense
        fallback={
          <p className="store-page-loading" role="status">
            Loading page…
          </p>
        }
      >
        <Page {...pageProps} />
      </Suspense>
    </ErrorBoundary>
  );
}
