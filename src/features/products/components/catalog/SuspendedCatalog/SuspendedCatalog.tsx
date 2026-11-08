import type { ReactElement } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCatalogQueryOptions } from '../../../modules/catalog/products.query.ts';
import type { Product } from '../../../modules/catalog/products.types.ts';
import { ProductCatalog } from '../ProductCatalog/ProductCatalog.tsx';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

/** Gates browsing on the shared validated request without owning another catalog copy.
 * @param props - Application-derived merged products and cart action.
 * @returns The catalog when ready; pending requests suspend and failures reach the local boundary.
 */
export function SuspendedCatalog({ products, onAddToCart }: Props): ReactElement {
  const query = useSuspenseQuery(getCatalogQueryOptions());
  if (query.error !== null && !query.isFetching) throw query.error;
  return <ProductCatalog products={products} onAddToCart={onAddToCart} />;
}
