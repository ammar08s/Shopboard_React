import type { ReactElement } from 'react';
import type { CatalogState } from '../../modules/catalog/useProducts.ts';
import type { Product } from '../../modules/catalog/products.types.ts';
import { ProductCatalog } from '../catalog/ProductCatalog/ProductCatalog.tsx';
import { ProductError } from '../feedback/ProductError/ProductError.tsx';
import { ProductLoading } from '../loading/ProductLoading/ProductLoading.tsx';

interface Props {
  state: CatalogState;
  products: Product[];
  onRetry: () => void;
  onAddToCart: (product: Product) => void;
}

/**
 * Connects application-owned catalog state to browsing and request feedback.
 * @param props - Request state, merged products, retry, and add-to-cart actions.
 * @returns Loading feedback, retryable error feedback, or the loaded catalog.
 */
export function Products({ state, products, onRetry, onAddToCart }: Props): ReactElement {
  if (state.status === 'loading') return <ProductLoading />;
  return (
    <>
      {state.status === 'error' ? <ProductError message={state.message} onRetry={onRetry} /> : null}
      {state.status === 'success' || products.length > 0 ? (
        <ProductCatalog products={products} onAddToCart={onAddToCart} />
      ) : null}
    </>
  );
}
