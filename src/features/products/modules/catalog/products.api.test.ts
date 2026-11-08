import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { getProduct } from './products.api.ts';

const productResponse = {
  id: 1,
  title: 'Leather Tote Bag',
  category_name: 'Bags',
  price_cents: 8900,
  in_stock: true,
};

/** Checks the individual endpoint, cancellation signal, and response mapping.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after the validated product is checked.
 */
async function loadsSingleProduct(context: TestContext): Promise<void> {
  const controller = new AbortController();
  /** Supplies the single-product response and inspects the request.
   * @param input - Requested API URL.
   * @param options - Request headers and cancellation signal.
   * @returns A successful backend response.
   */
  function respond(input: string | URL | Request, options?: RequestInit): Promise<Response> {
    assert.equal(String(input), 'https://shopboard-api.vercel.app/api/products/1');
    assert.equal(options?.signal, controller.signal);
    return Promise.resolve(Response.json(productResponse));
  }
  context.mock.method(globalThis, 'fetch', respond);
  assert.deepEqual(await getProduct(1, controller.signal), {
    id: 1,
    title: 'Leather Tote Bag',
    category: 'Bags',
    priceCents: 8900,
    inStock: true,
  });
}

test('loads and validates one product from its ID endpoint', loadsSingleProduct);

/** Distinguishes a missing product from transport failures.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after not-found behavior is checked.
 */
async function handlesMissingProduct(context: TestContext): Promise<void> {
  /** Supplies a missing-product response. No inputs.
   * @returns An HTTP 404 response.
   */
  function respond(): Promise<Response> {
    return Promise.resolve(Response.json({ detail: 'Not found' }, { status: 404 }));
  }
  context.mock.method(globalThis, 'fetch', respond);
  assert.equal(await getProduct(999, new AbortController().signal), null);
}

test('returns null for a product HTTP 404', handlesMissingProduct);

/** Keeps server errors available to the retry UI.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after the failed request is checked.
 */
async function rejectsServerFailure(context: TestContext): Promise<void> {
  /** Supplies a temporary server failure. No inputs.
   * @returns An HTTP 503 response.
   */
  function respond(): Promise<Response> {
    return Promise.resolve(new Response(null, { status: 503 }));
  }
  context.mock.method(globalThis, 'fetch', respond);
  await assert.rejects(getProduct(1, new AbortController().signal), /503/);
}

test('preserves product request failures for retry', rejectsServerFailure);

/** Rejects untrusted malformed API fields.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after response validation is checked.
 */
async function rejectsMalformedProduct(context: TestContext): Promise<void> {
  /** Supplies a product with an invalid price. No inputs.
   * @returns A successful HTTP response containing invalid application data.
   */
  function respond(): Promise<Response> {
    return Promise.resolve(Response.json({ ...productResponse, price_cents: '8900' }));
  }
  context.mock.method(globalThis, 'fetch', respond);
  await assert.rejects(getProduct(1, new AbortController().signal), /invalid information/);
}

test('rejects malformed single-product responses', rejectsMalformedProduct);

/** Prevents a backend mismatch from displaying the wrong requested product.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after the response identifier is checked.
 */
async function rejectsMismatchedProduct(context: TestContext): Promise<void> {
  /** Supplies a different product than requested. No inputs.
   * @returns A successful HTTP response with a mismatched identifier.
   */
  function respond(): Promise<Response> {
    return Promise.resolve(Response.json({ ...productResponse, id: 2 }));
  }
  context.mock.method(globalThis, 'fetch', respond);
  await assert.rejects(getProduct(1, new AbortController().signal), /wrong product/);
}

test('rejects a response for a different product ID', rejectsMismatchedProduct);

/** Preserves cancellation instead of turning it into missing-product feedback.
 * @param context - Test-scoped transport mock tracker.
 * @returns A promise resolving after the abort failure is checked.
 */
async function preservesCancellation(context: TestContext): Promise<void> {
  /** Simulates an aborted request. No inputs.
   * @returns A rejected promise carrying the browser abort error.
   */
  function respond(): Promise<Response> {
    return Promise.reject(new DOMException('Request aborted', 'AbortError'));
  }
  context.mock.method(globalThis, 'fetch', respond);
  await assert.rejects(getProduct(1, new AbortController().signal), { name: 'AbortError' });
}

test('preserves product request cancellation', preservesCancellation);
