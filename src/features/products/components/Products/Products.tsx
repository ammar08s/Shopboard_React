import type { ReactElement } from 'react';
import { useProducts } from '../../modules/catalog/useProducts.ts';
import { ProductCatalog } from '../ProductCatalog/ProductCatalog.tsx';
import { ProductError } from '../ProductError/ProductError.tsx';
import { ProductLoading } from '../ProductLoading/ProductLoading.tsx';

interface Props {
  children?: never;
}

/**
 * Connects catalog request state to the appropriate UI.
 * @param props - No configurable inputs.
 * @returns Loading feedback, retryable error feedback, or the loaded catalog.
 */
export function Products(_props: Props): ReactElement {
  const { state, retry } = useProducts();

  if (state.status === 'loading') return <ProductLoading />;
  if (state.status === 'error') return <ProductError message={state.message} onRetry={retry} />;

  return <ProductCatalog products={state.products} />;
}
