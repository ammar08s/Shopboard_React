import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { matchPath } from 'react-router';
import { parseProductId } from '../../../features/products/modules/details/products.details.ts';
import { getProductQueryOptions } from '../../../features/products/modules/catalog/products.query.ts';

/** Cancels the selected product request when its route leaves, including suspended renders.
 * @param pathname - Current route pathname outside the page's Suspense boundary.
 * @returns Nothing; synchronizes query lifetime with route lifetime.
 */
export function useProductRequestLifetime(pathname: string): void {
  const client = useQueryClient();
  const id = parseProductId(matchPath('/products/:productId', pathname)?.params.productId);
  /** Synchronizes request lifetime outside the suspended product page. No inputs.
   * @returns Cleanup that aborts this product's request on departure, or nothing for invalid IDs.
   */
  function synchronizeRequest(): (() => void) | undefined {
    if (id === null) return;
    const options = getProductQueryOptions(id);
    void client.prefetchQuery(options);
    /** Aborts only the departing product's cache entry. No inputs.
     * @returns Nothing; preserves other active requests and cached successful data.
     */
    function cancelRequest(): void {
      void client.cancelQueries({ queryKey: options.queryKey });
    }
    return cancelRequest;
  }
  useEffect(synchronizeRequest, [client, id]);
}
