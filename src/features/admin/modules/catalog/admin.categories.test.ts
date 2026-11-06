import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAdminCategories, resolveCategoryName } from './admin.categories.ts';
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
