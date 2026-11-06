import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseProducts } from './products.data.ts';

/** Validates API model mapping, including free and unavailable products. No inputs. @returns Nothing. */
function mapsProductData(): void {
  assert.deepEqual(
    parseProducts({
      items: [
        { id: 1, title: 'Tote', category_name: 'Bags', price_cents: 8900, in_stock: true },
        { id: 2, title: 'Boots', category_name: 'Shoes', price_cents: 0, in_stock: false },
      ],
      total: 2,
    }),
    [
      { id: 1, title: 'Tote', category: 'Bags', priceCents: 8900, inStock: true },
      { id: 2, title: 'Boots', category: 'Shoes', priceCents: 0, inStock: false },
    ],
  );
  assert.deepEqual(parseProducts({ items: [], total: 0 }), []);
}
test('maps API products and accepts an empty catalog', mapsProductData);

/** Checks that missing product lists are rejected. No inputs. @returns Nothing. */
function rejectsInvalidEnvelope(): void {
  /** Parses an envelope without items. No inputs. @returns Nothing; throws a validation error. */
  function missingItems(): void {
    parseProducts({ total: 0 });
  }
  assert.throws(missingItems, /unexpected response/);
}
test('rejects missing product lists', rejectsInvalidEnvelope);

/** Checks that malformed products are rejected. No inputs. @returns Nothing. */
function rejectsInvalidProduct(): void {
  /** Parses a malformed item. No inputs. @returns Nothing; throws a validation error. */
  function invalidItem(): void {
    parseProducts({ items: [{ id: 'wrong' }], total: 1 });
  }
  assert.throws(invalidItem, /invalid information/);
}
test('rejects invalid product fields', rejectsInvalidProduct);
