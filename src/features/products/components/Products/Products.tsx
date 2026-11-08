import type { ReactElement } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SectionError } from '../../../../shared/components/SectionError/SectionError.tsx';
import { RequestBoundary } from '../../../../shared/components/RequestBoundary/RequestBoundary.tsx';
import type { RequestErrorProps } from '../../../../shared/components/RequestBoundary/RequestBoundary.tsx';
import { getErrorMessage } from '../../../../shared/modules/errors/errors.ts';
import type { Product } from '../../modules/catalog/products.types.ts';
import { ProductCatalog } from '../catalog/ProductCatalog/ProductCatalog.tsx';
import { ProductError } from '../feedback/ProductError/ProductError.tsx';
import { ProductLoading } from '../loading/ProductLoading/ProductLoading.tsx';
import { CatalogRequest } from '../catalog/CatalogRequest/CatalogRequest.tsx';

interface Props {
  products: Product[];
  onRetry: () => void;
  onAddToCart: (product: Product) => void;
}

/**
 * Connects merged products to independently bounded request and browsing feedback.
 * @param props - Merged products, retry, and add-to-cart actions.
 * @returns Loading feedback, retryable error feedback, or the loaded catalog.
 */
export function Products({ products, onRetry, onAddToCart }: Props): ReactElement {
  /** Keeps saved products browsable when a catalog request or render fails.
   * @param props - Request failure and reset action.
   * @returns Retry feedback and any available local product snapshots.
   */
  function renderFailure({ error, resetErrorBoundary }: RequestErrorProps): ReactElement {
    return (
      <>
        <ProductError
          message={getErrorMessage(error, 'Unable to display the collection. Try again.')}
          onRetry={resetErrorBoundary}
        />
        {products.length > 0 ? (
          <ErrorBoundary FallbackComponent={SectionError}>
            <ProductCatalog products={products} onAddToCart={onAddToCart} />
          </ErrorBoundary>
        ) : null}
      </>
    );
  }
  return (
    <RequestBoundary loading={<ProductLoading />} renderError={renderFailure} onRetry={onRetry}>
      <CatalogRequest>
        <ProductCatalog products={products} onAddToCart={onAddToCart} />
      </CatalogRequest>
    </RequestBoundary>
  );
}
