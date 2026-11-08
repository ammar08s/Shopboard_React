import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getStorePageTitle, needsProductCatalog } from './storePage.ts';

/** Verifies titles use the same case and trailing-slash matching as the router. No inputs.
 * @returns Nothing; asserts aliases of matched routes retain the correct page title.
 */
function matchesRouterTitles(): void {
  assert.equal(getStorePageTitle('/ADMIN'), 'Demo administration');
  assert.equal(getStorePageTitle('/admin//'), 'Demo administration');
  assert.equal(getStorePageTitle('//'), 'Everyday essentials');
  assert.equal(getStorePageTitle('/PRODUCTS/1//'), 'Product details');
  assert.equal(getStorePageTitle('/products/1/extra'), 'Page not found');
}

test('matches router case and trailing-slash behavior when naming pages', matchesRouterTitles);

/** Enables the catalog only for paths the router treats as collection or admin. No inputs.
 * @returns Nothing; asserts matched aliases load data and unrelated routes do not.
 */
function matchesCatalogRoutes(): void {
  for (const path of ['/', '//', '/admin', '/ADMIN', '/admin//']) {
    assert.equal(needsProductCatalog(path), true);
  }
  for (const path of ['/products/1', '/cart', '/login', '/admin/extra', '/unknown']) {
    assert.equal(needsProductCatalog(path), false);
  }
}

test('enables catalog loading consistently with router matching', matchesCatalogRoutes);
