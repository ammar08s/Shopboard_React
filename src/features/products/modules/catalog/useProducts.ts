import { useEffect, useState } from 'react';
import { getProducts } from './products.api.ts';
import type { Product } from './products.types.ts';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

/** Loads catalog data with unmount cancellation. No inputs. @returns Catalog state and a retry action. */
export function useProducts(): { state: CatalogState; retry: () => void } {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  /** Starts a new request attempt. No inputs. @returns Nothing. */
  function retry(): void {
    setState({ status: 'loading' });
    setAttempt(attempt + 1);
  }
  /** Synchronizes catalog with the API. No inputs. @returns Request cleanup. */
  function loadProducts(): () => void {
    const controller = new AbortController();
    /** Stores valid results. @param products - Loaded catalog. @returns Nothing. */
    function loaded(products: Product[]): void {
      if (!controller.signal.aborted) setState({ status: 'success', products });
    }
    /** Stores a useful failure. @param error - Request failure. @returns Nothing. */
    function failed(error: unknown): void {
      if (!controller.signal.aborted)
        setState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Unable to load the store. Please try again.',
        });
    }
    void getProducts(controller.signal).then(loaded).catch(failed);
    /** Cancels the active request. No inputs. @returns Nothing. */
    function cleanup(): void {
      controller.abort();
    }
    return cleanup;
  }
  useEffect(loadProducts, [attempt]);
  return { state, retry };
}
