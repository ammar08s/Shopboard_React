import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateProductDraft } from './admin.products.ts';

/** Checks trimmed fields and exact cent conversion. No inputs. @returns Nothing. */
function validatesDraft(): void {
  assert.deepEqual(
    validateProductDraft({ title: ' Tote ', category: ' Bags ', price: '19.99', inStock: true }),
    {
      success: true,
      product: { title: 'Tote', category: 'Bags', priceCents: 1999, inStock: true },
    },
  );
  assert.deepEqual(
    validateProductDraft({ title: 'Gift', category: 'Other', price: '0', inStock: false }),
    {
      success: true,
      product: { title: 'Gift', category: 'Other', priceCents: 0, inStock: false },
    },
  );
}
test('validates product fields and converts USD to integer cents', validatesDraft);

/** Checks rejected prices and blank/oversized names. No inputs. @returns Nothing. */
function rejectsDraft(): void {
  for (const price of ['', '-1', '1.999', '1e3', 'Infinity', '1000000.01']) {
    assert.equal(
      validateProductDraft({ title: 'Tote', category: 'Bags', price, inStock: true }).success,
      false,
    );
  }
  assert.equal(
    validateProductDraft({ title: ' ', category: 'Bags', price: '1', inStock: true }).success,
    false,
  );
  assert.equal(
    validateProductDraft({ title: 'Tote', category: ' ', price: '1', inStock: true }).success,
    false,
  );
  assert.equal(
    validateProductDraft({ title: 'x'.repeat(121), category: 'Bags', price: '1', inStock: true })
      .success,
    false,
  );
}
test('rejects blank names and prices outside the supported cent precision and range', rejectsDraft);
