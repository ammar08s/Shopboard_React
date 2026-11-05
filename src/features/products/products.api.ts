import { getJson } from '../../shared/api/apiClient.ts';
import { parseProducts } from './products.data.ts';
import type { Product } from './products.types.ts';

/** Fetches the validated catalog. @param signal - Cancellation signal. @returns Available product records. @throws Error for request or validation failures. */
export async function getProducts(signal: AbortSignal): Promise<Product[]> {
  return parseProducts(await getJson('/api/products', signal));
}
