import { getProduct, getProducts } from './products.api.ts';
import type { Product } from './products.types.ts';

const PRODUCT_CACHE_FRESH_MS = 60_000;

interface ProductQueryOptions<Value> {
  queryKey: readonly (string | number | null)[];
  queryFn: (context: { signal: AbortSignal }) => Promise<Value>;
  staleTime: number;
  retry: false;
  refetchOnWindowFocus: false;
  refetchOnReconnect: false;
  networkMode: 'always';
}

const productQueryDefaults: Omit<ProductQueryOptions<unknown>, 'queryKey' | 'queryFn'> = {
  staleTime: PRODUCT_CACHE_FRESH_MS,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  networkMode: 'always',
};

/** Requests catalog data through the feature API.
 * @param context - Cache-managed request cancellation signal.
 * @returns Validated catalog records; rejects on HTTP or validation failure.
 */
function requestCatalog({ signal }: { signal: AbortSignal }): Promise<Product[]> {
  return getProducts(signal);
}

export const catalogQueryOptions: ProductQueryOptions<Product[]> = {
  ...productQueryDefaults,
  queryKey: ['products', 'catalog'],
  queryFn: requestCatalog,
};

/** Defines an independent cache entry for a selected product.
 * @param productId - Validated route ID, or null for an invalid URL.
 * @returns Product query settings; invalid IDs resolve to not-found without HTTP access.
 */
export function getProductQueryOptions(
  productId: number | null,
): ProductQueryOptions<Product | null> {
  /** Requests only the selected product.
   * @param context - Cache-managed transport cancellation signal.
   * @returns A validated product, or null for a missing/invalid ID.
   */
  function requestProduct({ signal }: { signal: AbortSignal }): Promise<Product | null> {
    return productId === null ? Promise.resolve(null) : getProduct(productId, signal);
  }
  return {
    ...productQueryDefaults,
    queryKey: ['products', 'detail', productId],
    queryFn: requestProduct,
  };
}
