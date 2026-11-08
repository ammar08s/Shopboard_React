import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyDemoChanges,
  createDemoProduct,
  updateDemoProduct,
  deleteDemoProduct,
  deleteDemoCategory,
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

/** Checks deletion moves products without losing edits, restoring deleted products, or mutating API data. No inputs.
 * @returns Nothing.
 */
function deletesCategory(): void {
  const boots = { ...original, id: 3, title: 'Boots', category: 'Shoes' };
  const base = [original, { ...original, id: 2, title: 'Pouch', category: ' BAGS ' }, boots];
  const edited = { ...original, title: 'Edited tote', priceCents: 999 };
  const created = { ...original, id: -1, title: 'Local bag', category: 'bags' };
  const changes = { products: [edited, created], deletedIds: [2] };
  const removed = deleteDemoCategory(base, changes, ' bags ', 'Accessories');
  const expected = [
    { ...edited, category: 'Accessories' },
    boots,
    { ...created, category: 'Accessories' },
  ];
  assert.deepEqual(applyDemoChanges(base, removed), expected);
  assert.deepEqual(removed.deletedIds, [2]);
  assert.equal(original.category, 'Bags');
  assert.equal(changes.products[0]?.category, 'Bags');
  assert.equal(changes.products[1]?.category, 'bags');
  const restored = parseDemoChanges(JSON.stringify({ version: 1, ...removed }));
  assert.deepEqual(applyDemoChanges(base, restored), expected);
}
test(
  'deletes categories locally by moving API and demo products and persists the result',
  deletesCategory,
);

/** Checks invalid category moves cannot create blank or unchanged destinations. No inputs.
 * @returns Nothing.
 */
function rejectsInvalidCategoryMoves(): void {
  const changes = { products: [], deletedIds: [] };
  assert.deepEqual(deleteDemoCategory([original], changes, 'Bags', ' bags '), changes);
  assert.deepEqual(deleteDemoCategory([original], changes, 'Bags', ' '), changes);
  assert.deepEqual(deleteDemoCategory([original], changes, 'Missing', 'Home'), changes);
}
test('ignores invalid or missing category moves', rejectsInvalidCategoryMoves);
