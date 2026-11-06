import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product } from '../catalog/products.types.ts';
import {
  getProductCategories,
  initialProductFilters,
  selectProducts,
  updateProductSort,
} from './products.filters.ts';

const products: Product[] = [
  { id: 1, title: 'Tote', category: 'Bags', priceCents: 8900, inStock: true },
  { id: 2, title: 'Boots', category: 'Shoes', priceCents: 0, inStock: false },
  { id: 3, title: 'Cap', category: 'Bags', priceCents: 2500, inStock: true },
];

/** Checks combined filtering and search normalization. No inputs. @returns Nothing. */
function filtersCatalog(): void {
  assert.deepEqual(
    selectProducts(products, { query: ' TOTE ', category: 'Bags', stockOnly: true, sort: 'name' }),
    [products[0]],
  );
  assert.deepEqual(
    selectProducts(products, { query: '', category: 'Shoes', stockOnly: true, sort: 'name' }),
    [],
  );
  assert.deepEqual(
    selectProducts(products, { ...initialProductFilters, query: 'no such product' }),
    [],
  );
  assert.deepEqual(selectProducts([], initialProductFilters), []);
}
test('combines name, category, and stock filters and handles no matches', filtersCatalog);

/** Checks all ordering modes without changing source order. No inputs. @returns Nothing. */
function sortsCatalog(): void {
  const originalProducts = structuredClone(products);
  assert.deepEqual(selectProducts(products, initialProductFilters), [
    products[1],
    products[2],
    products[0],
  ]);
  assert.deepEqual(
    selectProducts(products, { ...initialProductFilters, query: '   ', sort: 'price-asc' }),
    [products[1], products[2], products[0]],
  );
  assert.deepEqual(selectProducts(products, { ...initialProductFilters, sort: 'price-desc' }), [
    products[0],
    products[2],
    products[1],
  ]);
  assert.deepEqual(products, originalProducts);
}
test('sorts names and both price directions without mutating the catalog', sortsCatalog);

/** Checks distinct sorted categories, including an empty catalog. No inputs. @returns Nothing. */
function derivesCategories(): void {
  assert.deepEqual(getProductCategories(products), ['Bags', 'Shoes']);
  assert.deepEqual(getProductCategories([]), []);
}
test('derives unique alphabetical category options', derivesCategories);

/** Checks sort validation and preservation of other filters. No inputs. @returns Nothing. */
function updatesSort(): void {
  const filters = { ...initialProductFilters, query: 'tote', category: 'Bags', stockOnly: true };
  const ascending = updateProductSort(filters, 'price-asc');
  assert.deepEqual(ascending, { ...filters, sort: 'price-asc' });
  assert.deepEqual(updateProductSort(ascending, 'price-desc'), { ...filters, sort: 'price-desc' });
  assert.deepEqual(updateProductSort(ascending, 'name'), filters);
  assert.equal(updateProductSort(filters, 'unsupported'), filters);
  assert.equal(filters.sort, 'name');
  assert.deepEqual(initialProductFilters, {
    query: '',
    category: '',
    stockOnly: false,
    sort: 'name',
  });
}
test('accepts supported sort values without changing other filters or defaults', updatesSort);
