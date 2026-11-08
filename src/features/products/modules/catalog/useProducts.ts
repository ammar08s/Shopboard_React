import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogQueryOptions } from './products.query.ts';
import { getErrorMessage } from '../../../../shared/modules/errors/errors.ts';
import type { Product } from './products.types.ts';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

/** Observes the shared catalog cache without suspending the application shell.
 * @param enabled - Whether the current route needs collection data.
 * @returns Derived request feedback and an explicit retry action; no copied API state.
 */
export function useProducts(enabled: boolean = true): { state: CatalogState; retry: () => void } {
  const client = useQueryClient();
  const query = useQuery({ ...catalogQueryOptions, enabled });
  /** Ties the catalog transport to routes that need it. No inputs.
   * @returns Request cancellation when an enabled catalog route is left.
   */
  function synchronizeRequest(): (() => void) | undefined {
    if (!enabled) return;
    /** Stops a pending catalog request without clearing validated cached data. No inputs.
     * @returns Nothing; cancels the transport as the last catalog route leaves.
     */
    function cancelRequest(): void {
      void client.cancelQueries({ queryKey: catalogQueryOptions.queryKey });
    }
    return cancelRequest;
  }
  useEffect(synchronizeRequest, [client, enabled]);
  /** Starts a fresh attempt in the same shared cache entry. No inputs.
   * @returns Nothing; observers receive pending, error, or successful results from the cache.
   */
  function retry(): void {
    void query.refetch();
  }
  let state: CatalogState = { status: 'loading' };
  if (query.isError)
    state = {
      status: 'error',
      message: getErrorMessage(query.error, 'Unable to load the store. Please try again.'),
    };
  else if (query.data !== undefined) state = { status: 'success', products: query.data };
  return { state, retry };
}
