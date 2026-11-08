import type { ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SectionError } from '../../../shared/components/SectionError/SectionError.tsx';
import { AdminDashboard } from '../../../features/admin/components/AdminDashboard/AdminDashboard.tsx';
import type {
  Props as DashboardProps,
  ProductListProps,
} from '../../../features/admin/components/AdminDashboard/AdminDashboard.tsx';
import { AdminProductList } from '../../../features/admin/components/AdminProductList/AdminProductList.tsx';
import { RequestBoundary } from '../../../shared/components/RequestBoundary/RequestBoundary.tsx';
import type { RequestErrorProps } from '../../../shared/components/RequestBoundary/RequestBoundary.tsx';
import { getErrorMessage } from '../../../shared/modules/errors/errors.ts';
import { CatalogRequest } from '../../../features/products/components/catalog/CatalogRequest/CatalogRequest.tsx';
import './AdminPage.css';

interface Props extends Omit<DashboardProps, 'renderProducts'> {
  onRetry: () => void;
}

/** Keeps admin forms mounted while the independent API-backed list loads or recovers.
 * @param props - Application-owned catalog, session-independent mutations, and request retry.
 * @returns The persistent dashboard with isolated loading and failure UI around its product list.
 */
export function AdminPage({ onRetry, ...props }: Props): ReactElement {
  /** Connects dashboard event handlers to the separately suspended product list.
   * @param listProps - Current products and dashboard editing/deletion actions.
   * @returns A bounded API list plus available local records during loading or failure.
   */
  function renderProducts(listProps: ProductListProps): ReactElement {
    const localList =
      listProps.products.length > 0 ? (
        <ErrorBoundary FallbackComponent={SectionError}>
          <AdminProductList {...listProps} />
        </ErrorBoundary>
      ) : null;
    /** Renders request recovery without removing the editor or local records.
     * @param errorProps - Failed request and reset action.
     * @returns A retryable alert and locally editable products.
     */
    function renderFailure({ error, resetErrorBoundary }: RequestErrorProps): ReactElement {
      return (
        <>
          <div className="admin-dashboard-warning" role="alert">
            <p>
              {getErrorMessage(error, 'Unable to display the API collection.')} Your saved demo
              products remain editable.
            </p>
            <button type="button" onClick={resetErrorBoundary}>
              Retry collection
            </button>
          </div>
          {localList}
        </>
      );
    }
    return (
      <section className="store-admin-products" aria-label="Admin products">
        <RequestBoundary
          onRetry={onRetry}
          renderError={renderFailure}
          loading={
            <>
              <p role="status">Loading the API collection. You can still create demo products.</p>
              {localList}
            </>
          }
        >
          <CatalogRequest>
            <AdminProductList {...listProps} />
          </CatalogRequest>
        </RequestBoundary>
      </section>
    );
  }
  return <AdminDashboard {...props} renderProducts={renderProducts} />;
}
