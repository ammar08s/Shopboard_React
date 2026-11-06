import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyDemoChanges,
  createDemoProduct,
  updateDemoProduct,
  deleteDemoProduct,
  parseDemoChanges,
} from './products.demo.ts';
import type { Product } from '../catalog/products.types.ts';

const original: Product = {
  id: 1,
  title: 'Tote',
  category: 'Bags',
  priceCents: 1999,
  inStock: true,
};

/** Checks local CRUD without mutating original API data. No inputs. @returns Nothing. */
function changesCatalog(): void {
  const empty = { products: [], deletedIds: [] };
  const added = createDemoProduct(empty, {
    title: 'Cup',
    category: 'Home',
    priceCents: 500,
    inStock: true,
  });
  assert.equal(added.products[0]?.id, -1);
  assert.equal(applyDemoChanges([original], added).length, 2);
  const edited = updateDemoProduct(added, 1, {
    title: 'New tote',
    category: 'Bags',
    priceCents: 1299,
    inStock: false,
  });
  assert.deepEqual(applyDemoChanges([original], edited)[0], {
    ...original,
    title: 'New tote',
    priceCents: 1299,
    inStock: false,
  });
  const removed = deleteDemoProduct(edited, 1);
  assert.deepEqual(applyDemoChanges([original], removed), added.products);
  assert.equal(original.title, 'Tote');
  assert.deepEqual(empty, { products: [], deletedIds: [] });
  const deletedCreated = deleteDemoProduct(removed, -1);
  assert.equal(
    createDemoProduct(deletedCreated, {
      title: 'Plate',
      category: 'Home',
      priceCents: 800,
      inStock: true,
    }).products[0]?.id,
    -2,
  );
}
test('merges local CRUD with API products without mutation or reused IDs', changesCatalog);

/** Checks versioned saved changes and rejection of corrupt values. No inputs. @returns Nothing. */
function validatesSavedChanges(): void {
  const changes = { products: [original], deletedIds: [2] };
  assert.deepEqual(parseDemoChanges(JSON.stringify({ version: 1, ...changes })), changes);
  assert.deepEqual(parseDemoChanges(null), { products: [], deletedIds: [] });
  for (const raw of [
    'bad',
    '{}',
    '{"version":2,"products":[],"deletedIds":[]}',
    JSON.stringify({ version: 1, products: [{ ...original, priceCents: -1 }], deletedIds: [] }),
    JSON.stringify({ version: 1, products: [original, original], deletedIds: [] }),
  ]) {
    /** Parses an invalid saved value. No inputs. @returns Nothing; throws validation failure. */
    function parseInvalid(): void {
      parseDemoChanges(raw);
    }
    assert.throws(parseInvalid);
  }
}
test(
  'validates saved catalog changes and rejects invalid or duplicate products',
  validatesSavedChanges,
);
