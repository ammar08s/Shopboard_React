import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatPrice } from './products.price.ts';

/** Checks USD formatting from integer cents. No inputs. @returns Nothing. */
function formatsPrices(): void {
  assert.equal(formatPrice(0), '$0.00');
  assert.equal(formatPrice(8900), '$89.00');
  assert.equal(formatPrice(125), '$1.25');
}
test('formats prices in USD without losing cents', formatsPrices);
