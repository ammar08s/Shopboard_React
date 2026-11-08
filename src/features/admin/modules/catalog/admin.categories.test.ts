import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getAdminCategories,
  resolveCategoryName,
  getCategoryProductCount,
  validateCategoryDeletion,
  replaceDeletedCategory,
} from './admin.categories.ts';
import type { AdminProduct } from './admin.products.types.ts';

/** Checks dropdown choices include API and newly saved demo product categories. No inputs.
 * @returns Nothing.
 */
function derivesCategoryOptions(): void {
  const products: AdminProduct[] = [
    { id: 1, title: 'Tote', category: 'Bags', priceCents: 100, inStock: true },
    { id: 2, title: 'Boots', category: ' Shoes ', priceCents: 200, inStock: true },
    { id: 3, title: 'Pouch', category: ' bags ', priceCents: 300, inStock: true },
    { id: -1, title: 'Cup', category: 'Home', priceCents: 400, inStock: true },
    { id: 4, title: 'Uncategorized', category: ' ', priceCents: 0, inStock: false },
  ];
  assert.deepEqual(getAdminCategories(products), ['Bags', 'Home', 'Shoes']);
  assert.deepEqual(getAdminCategories([]), []);
  assert.equal(products[1]?.category, ' Shoes ');
}
test('derives sorted unique category choices from the current collection', derivesCategoryOptions);

/** Checks category creation reuses existing spelling and trims genuinely new names. No inputs.
 * @returns Nothing.
 */
function resolvesNewCategory(): void {
  assert.equal(resolveCategoryName(' bags ', ['Bags', 'Shoes']), 'Bags');
  assert.equal(resolveCategoryName(' BAGS ', ['Bags', 'Shoes']), 'Bags');
  assert.equal(resolveCategoryName(' Home & living ', ['Bags', 'Shoes']), 'Home & living');
  assert.equal(resolveCategoryName(' ', ['Bags']), '');
}
test(
  'reuses existing categories without capitalization or whitespace duplicates',
  resolvesNewCategory,
);

/** Checks that deletion chooses a different valid category and preserves canonical names. No inputs.
 * @returns Nothing.
 */
function validatesDeletion(): void {
  assert.deepEqual(validateCategoryDeletion(' bagz ', ' BAGS ', ['Bagz', 'Bags']), {
    success: true,
    category: 'Bagz',
    replacement: 'Bags',
  });
  assert.deepEqual(validateCategoryDeletion('Bagz', ' Uncategorized ', ['Bagz']), {
    success: true,
    category: 'Bagz',
    replacement: 'Uncategorized',
  });
  assert.deepEqual(validateCategoryDeletion('Uncategorized', 'Home', ['Uncategorized']), {
    success: true,
    category: 'Uncategorized',
    replacement: 'Home',
  });
  for (const replacement of ['', ' ', ' BAGZ ', 'x'.repeat(61)]) {
    assert.equal(validateCategoryDeletion('Bagz', replacement, ['Bagz']).success, false);
  }
  assert.equal(validateCategoryDeletion('Missing', 'Bags', ['Bags']).success, false);
}
test(
  'requires an existing source and a different valid replacement before deleting a category',
  validatesDeletion,
);

/** Checks the deletion impact count includes all normalized spellings. No inputs.
 * @returns Nothing.
 */
function countsAffectedProducts(): void {
  const products: AdminProduct[] = [
    { id: 1, title: 'Tote', category: 'Bags', priceCents: 100, inStock: true },
    { id: -1, title: 'Pouch', category: ' bags ', priceCents: 200, inStock: true },
    { id: 2, title: 'Boots', category: 'Shoes', priceCents: 300, inStock: false },
  ];
  assert.equal(getCategoryProductCount(products, ' BAGS '), 2);
  assert.equal(getCategoryProductCount(products, 'Missing'), 0);
}
test('counts all products affected by category deletion', countsAffectedProducts);

/** Checks a deletion updates the selection immediately so an old name cannot revive later. No inputs.
 * @returns Nothing.
 */
function preservesReassignedSelection(): void {
  const moved = replaceDeletedCategory('A', 'A', 'B');
  assert.equal(moved, 'B');
  assert.equal(replaceDeletedCategory(moved, 'C', 'A'), 'B');
  assert.equal(replaceDeletedCategory(' a ', 'A', 'B'), 'B');
  assert.equal(replaceDeletedCategory('Shoes', 'Bags', 'Home'), 'Shoes');
}
test(
  'keeps the replacement selected when a deleted category name is later reused',
  preservesReassignedSelection,
);
