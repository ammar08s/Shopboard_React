import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectProducts } from './products.logic.ts';
import { parseProducts } from './products.data.ts';

/** Tests catalog behavior. No inputs. @returns Nothing. */
function catalogBehavior(): void {
  const products = parseProducts({
    items: [
      { id: 1, title: 'Tote', category_name: 'Bags', price_cents: 8900, in_stock: true },
      { id: 2, title: 'Boots', category_name: 'Shoes', price_cents: 0, in_stock: false },
    ],
    total: 2,
  });
  assert.equal(products[0]?.priceCents, 8900);
  assert.equal(
    selectProducts(products, { query: ' TOTE ', category: 'Bags', stockOnly: true, sort: 'name' })
      .length,
    1,
  );
  assert.equal(
    selectProducts(products, { query: '', category: 'Shoes', stockOnly: true, sort: 'name' })
      .length,
    0,
  );
  assert.equal(
    selectProducts(products, { query: '   ', category: '', stockOnly: false, sort: 'price-asc' })[0]
      ?.id,
    2,
  );
  assert.equal(products[0]?.id, 1);
  assert.deepEqual(parseProducts({ items: [], total: 0 }), []);
  /** Exercises malformed API data. No inputs. @returns Never for this invalid payload. */
  function invalidPayload(): void {
    parseProducts({ items: [{ id: 'wrong' }], total: 1 });
  }
  assert.throws(invalidPayload);
}
test('catalog maps data, combines filters, and sorts without mutation', catalogBehavior);

/** Checks malformed envelope rejection. No inputs. @returns Nothing. */
function invalidEnvelope(): void {
  /** Parses a missing catalog. No inputs. @returns Nothing. */
  function missingItems(): void {
    parseProducts({ total: 0 });
  }
  assert.throws(missingItems);
}
test('rejects missing product lists', invalidEnvelope);

/** Checks descending price and unmatched searches. No inputs. @returns Nothing. */
function sortingAndEmptySearch(): void {
  const products = parseProducts({
    items: [
      { id: 1, title: 'Tote', category_name: 'Bags', price_cents: 8900, in_stock: true },
      { id: 2, title: 'Boots', category_name: 'Shoes', price_cents: 6000, in_stock: false },
    ],
    total: 2,
  });
  assert.equal(
    selectProducts(products, { query: '', category: '', stockOnly: false, sort: 'price-desc' })[0]
      ?.id,
    1,
  );
  assert.equal(
    selectProducts(products, { query: '', category: '', stockOnly: false, sort: 'name' })[0]?.id,
    2,
  );
  assert.equal(
    selectProducts(products, {
      query: 'no such product',
      category: '',
      stockOnly: false,
      sort: 'name',
    }).length,
    0,
  );
}
test('sorts names and descending prices and handles no matches', sortingAndEmptySearch);
