import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { catalogQueryOptions, getProductQueryOptions } from './products.query.ts';

const apiProduct = {
  id: 1,
  title: 'Tote',
  category_name: 'Bags',
  price_cents: 8900,
  in_stock: true,
};

/** Verifies catalog readers share one validated cache entry while detail data stays independent.
 * @param context - Test-scoped HTTP mock tracker.
 * @returns A promise resolving after cache identity and endpoint selection are checked.
 */
async function sharesCatalogData(context: TestContext): Promise<void> {
  const requested: string[] = [];
  /** Returns API-shaped data from the requested endpoint.
   * @param input - Requested URL.
   * @returns A backend response for catalog or detail.
   */
  function respond(input: string | URL | Request): Promise<Response> {
    const url = String(input);
    requested.push(url);
    return Promise.resolve(
      Response.json(url.endsWith('/1') ? apiProduct : { items: [apiProduct], total: 1 }),
    );
  }
  context.mock.method(globalThis, 'fetch', respond);
  const client = new QueryClient();
  try {
    const first = await client.fetchQuery(catalogQueryOptions);
    const second = await client.fetchQuery(catalogQueryOptions);
    assert.equal(first, second);
    assert.deepEqual(first, [
      { id: 1, title: 'Tote', category: 'Bags', priceCents: 8900, inStock: true },
    ]);
    assert.equal((await client.fetchQuery(getProductQueryOptions(1)))?.id, 1);
    assert.deepEqual(requested, [
      'https://shopboard-api.vercel.app/api/products',
      'https://shopboard-api.vercel.app/api/products/1',
    ]);
  } finally {
    client.clear();
  }
}
test(
  'shares catalog data between readers and separates product-detail cache keys',
  sharesCatalogData,
);

/** Verifies failures remain retryable and invalid product IDs make no request.
 * @param context - Test-scoped HTTP mock tracker.
 * @returns A promise resolving after failure recovery and invalid-ID behavior are checked.
 */
async function retriesFailedRequests(context: TestContext): Promise<void> {
  let requests = 0;
  /** Fails the first explicit attempt and succeeds on the next.
   * @returns A promise containing a retryable failure or valid catalog.
   */
  function respond(): Promise<Response> {
    requests += 1;
    return Promise.resolve(
      requests === 1 ? new Response(null, { status: 500 }) : Response.json({ items: [], total: 0 }),
    );
  }
  context.mock.method(globalThis, 'fetch', respond);
  const client = new QueryClient();
  try {
    await assert.rejects(client.fetchQuery(catalogQueryOptions), /500/);
    assert.equal(requests, 1);
    assert.deepEqual(await client.fetchQuery(catalogQueryOptions), []);
    assert.equal(await client.fetchQuery(getProductQueryOptions(null)), null);
    assert.equal(requests, 2);
  } finally {
    client.clear();
  }
}
test(
  'retries failed requests explicitly and does not fetch invalid product IDs',
  retriesFailedRequests,
);

/** Verifies leaving an active request aborts the shared HTTP transport.
 * @param context - Test-scoped HTTP mock tracker.
 * @returns A promise resolving after cancellation reaches fetch.
 */
async function cancelsTransport(context: TestContext): Promise<void> {
  const request: { signal: AbortSignal | null } = { signal: null };
  /** Records the transport's abort signal and holds its result until cancellation.
   * @param input - Requested URL.
   * @param options - Request configuration.
   * @returns A promise rejected when the request is aborted.
   */
  function respond(_input: string | URL | Request, options?: RequestInit): Promise<Response> {
    request.signal = options?.signal ?? null;
    /** Rejects the in-flight response when its transport is cancelled.
     * @param resolve - Unused success callback.
     * @param reject - Promise rejection callback.
     * @returns Nothing; subscribes to the actual transport signal.
     */
    function hold(_resolve: (response: Response) => void, reject: (error: Error) => void): void {
      /** Publishes the browser's cancellation outcome. No inputs.
       * @returns Nothing; rejects this simulated HTTP operation.
       */
      function aborted(): void {
        reject(new DOMException('Aborted', 'AbortError'));
      }
      request.signal?.addEventListener('abort', aborted, { once: true });
    }
    return new Promise(hold);
  }
  context.mock.method(globalThis, 'fetch', respond);
  const client = new QueryClient();
  const options = getProductQueryOptions(1);
  try {
    const pending = client.fetchQuery(options);
    const cancelled = assert.rejects(pending);
    await client.cancelQueries({ queryKey: options.queryKey });
    await cancelled;
    assert.ok(request.signal !== null);
    assert.equal(request.signal.aborted, true);
  } finally {
    client.clear();
  }
}
test('propagates request cancellation to the API transport', cancelsTransport);
