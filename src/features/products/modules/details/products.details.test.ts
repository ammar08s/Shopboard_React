import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseProductId } from './products.details.ts';

/** Checks canonical positive route identifiers. No inputs.
 * @returns Nothing; asserts that valid identifiers retain their numeric values.
 */
function acceptsProductIds(): void {
  assert.equal(parseProductId('1'), 1);
  assert.equal(parseProductId('12'), 12);
  assert.equal(parseProductId(String(Number.MAX_SAFE_INTEGER)), Number.MAX_SAFE_INTEGER);
}

test('accepts positive safe-integer product route IDs', acceptsProductIds);

/** Rejects missing, malformed, local-only, and unsafe identifiers. No inputs.
 * @returns Nothing; asserts that invalid route values cannot start a product request.
 */
function rejectsInvalidIds(): void {
  const invalidValues = [
    undefined,
    '',
    '0',
    '-1',
    '01',
    '1.5',
    '1e2',
    ' 1 ',
    'abc',
    '9007199254740992',
  ];
  for (const value of invalidValues) assert.equal(parseProductId(value), null);
}

test('rejects invalid product route IDs', rejectsInvalidIds);
