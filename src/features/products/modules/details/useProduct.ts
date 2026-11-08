import { useEffect, useState } from 'react';
import { getProduct } from '../catalog/products.api.ts';
import type { Product } from '../catalog/products.types.ts';

export type ProductDetailsState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; product: Product };

interface ProductResult {
  productId: number;
  state: ProductDetailsState;
}

/** Loads one product and discards results after cancellation or route changes.
 * @param productId - Validated API identifier, or null for an invalid route parameter.
 * @returns Current detail state and a retry action.
 */
export function useProduct(productId: number | null): {
  state: ProductDetailsState;
  retry: () => void;
} {
  const [result, setResult] = useState<ProductResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** Starts another request without keeping stale error or success content. No inputs.
   * @returns Nothing; clears the previous result and schedules a new attempt.
   */
  function retry(): void {
    setResult(null);
    /** Advances the request attempt independently of render timing.
     * @param previous - Last retry counter.
     * @returns The next retry counter.
     */
    function nextAttempt(previous: number): number {
      return previous + 1;
    }
    setAttempt(nextAttempt);
  }

  /** Synchronizes the selected API product with the current route and retry attempt. No inputs.
   * @returns Cleanup for an active request, or nothing for an invalid identifier.
   */
  function loadProduct(): (() => void) | undefined {
    if (productId === null) return;
    const id = productId;
    const controller = new AbortController();

    /** Publishes a matching product or explicit not-found state.
     * @param product - Validated product, or null for HTTP 404.
     * @returns Nothing; ignores results from cancelled requests.
     */
    function loaded(product: Product | null): void {
      if (controller.signal.aborted) return;
      setResult({
        productId: id,
        state: product === null ? { status: 'not-found' } : { status: 'success', product },
      });
    }

    /** Publishes a retryable error for the selected product.
     * @param error - Unknown request or validation failure.
     * @returns Nothing; ignores errors caused by cancellation.
     */
    function failed(error: unknown): void {
      if (controller.signal.aborted) return;
      setResult({
        productId: id,
        state: {
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Unable to load this product. Try again.',
        },
      });
    }

    void getProduct(id, controller.signal).then(loaded).catch(failed);

    /** Cancels this request when the route changes or the page unmounts. No inputs.
     * @returns Nothing; aborts the transport and prevents stale state updates.
     */
    function cleanup(): void {
      controller.abort();
    }
    return cleanup;
  }

  useEffect(loadProduct, [productId, attempt]);

  let state: ProductDetailsState = { status: 'loading' };
  if (productId === null) state = { status: 'not-found' };
  else if (result !== null && result.productId === productId) state = result.state;
  return { state, retry };
}
