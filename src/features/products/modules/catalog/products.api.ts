import { getJson, HttpError } from '../../../../shared/api/apiClient.ts';
import { parseProduct, parseProducts } from './products.data.ts';
import type { Product } from './products.types.ts';

/** Fetches the validated catalog. @param signal - Cancellation signal. @returns Available product records. @throws Error for request or validation failures. */
export async function getProducts(signal: AbortSignal): Promise<Product[]> {
  return parseProducts(await getJson('/api/products', signal));
}

/** Fetches and validates one API product.
 * @param id - Positive product identifier parsed from the route.
 * @param signal - Request cancellation signal.
 * @returns The requested product, or null when the backend returns HTTP 404.
 * @throws Error for transport failures, malformed data, or a mismatched product ID.
 */
export async function getProduct(id: number, signal: AbortSignal): Promise<Product | null> {
  try {
    const product = parseProduct(await getJson(`/api/products/${id}`, signal));
    if (product.id !== id)
      throw new Error('The store returned the wrong product. Please try again.');
    return product;
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}
