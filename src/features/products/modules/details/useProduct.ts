import { useSuspenseQuery } from '@tanstack/react-query';
import { getProductQueryOptions } from '../catalog/products.query.ts';
import type { Product } from '../catalog/products.types.ts';

/** Reads one product through the surrounding Suspense and Error Boundaries.
 * @param productId - Validated route identifier, or null for an invalid URL.
 * @returns A validated product, or null for not-found; pending requests suspend and failures throw.
 */
export function useProduct(productId: number | null): Product | null {
  const query = useSuspenseQuery(getProductQueryOptions(productId));
  if (query.error !== null && !query.isFetching) throw query.error;
  return query.data;
}
