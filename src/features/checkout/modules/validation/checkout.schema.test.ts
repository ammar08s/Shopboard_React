import assert from 'node:assert/strict';
import { test } from 'node:test';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from './checkout.schema.ts';
import type { CheckoutInput } from './checkout.schema.ts';

const validCheckout: CheckoutInput = {
  fullName: '  Ayşe Yılmaz  ',
  email: '  ayse@example.com  ',
  addressLine1: '  Bağdat Caddesi 12  ',
  addressLine2: '  Daire 3  ',
  city: '  İstanbul  ',
  region: '  Kadıköy  ',
  postalCode: '  34710  ',
  country: '  Türkiye  ',
};

/** Checks that successful validation returns trimmed delivery details. No inputs.
 * @returns Nothing; asserts international text and email normalization without mutating input.
 */
function normalizesCheckout(): void {
  assert.deepEqual(checkoutSchema.parse(validCheckout), {
    fullName: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    addressLine1: 'Bağdat Caddesi 12',
    addressLine2: 'Daire 3',
    city: 'İstanbul',
    region: 'Kadıköy',
    postalCode: '34710',
    country: 'Türkiye',
  });
  assert.equal(validCheckout.fullName, '  Ayşe Yılmaz  ');
  assert.equal(
    checkoutSchema.safeParse({ ...validCheckout, postalCode: 'SW1A 1AA' }).success,
    true,
  );
}
test(
  'normalizes checkout details and accepts international names and postal codes',
  normalizesCheckout,
);

/** Checks optional delivery fields accept missing or blank values. No inputs.
 * @returns Nothing; asserts both optional fields normalize to empty strings.
 */
function acceptsOptionalFields(): void {
  const { addressLine2: _addressLine2, region: _region, ...requiredDetails } = validCheckout;
  const parsed = checkoutSchema.parse(requiredDetails);
  assert.equal(parsed.addressLine2, '');
  assert.equal(parsed.region, '');
  assert.equal(checkoutSchema.parse({ ...validCheckout, addressLine2: '  ' }).addressLine2, '');
}
test('accepts omitted or blank apartment and region fields', acceptsOptionalFields);

/** Checks each required field rejects whitespace with actionable feedback. No inputs.
 * @returns Nothing; asserts failures identify the relevant field.
 */
function rejectsMissingDetails(): void {
  const requiredFields = ['fullName', 'email', 'addressLine1', 'city', 'postalCode', 'country'];
  for (const field of requiredFields) {
    const result = checkoutSchema.safeParse({ ...validCheckout, [field]: '  ' });
    assert.equal(result.success, false, field);
    if (result.success) throw new Error(`Expected ${field} validation to fail.`);
    assert.equal(result.error.issues[0]?.path[0], field);
    assert.match(result.error.issues[0]?.message ?? '', /enter/i);
  }
  assert.equal(checkoutSchema.safeParse(null).success, false);
}
test(
  'rejects missing required checkout details with field-specific messages',
  rejectsMissingDetails,
);

/** Checks invalid email addresses and oversized fields cannot be submitted. No inputs.
 * @returns Nothing; asserts schema boundaries independently of form markup.
 */
function rejectsInvalidDetails(): void {
  assert.equal(checkoutSchema.safeParse({ ...validCheckout, email: 'ayse@' }).success, false);
  const limits = [
    { field: 'fullName', limit: 100 },
    { field: 'email', limit: 254 },
    { field: 'addressLine1', limit: 200 },
    { field: 'addressLine2', limit: 200 },
    { field: 'city', limit: 100 },
    { field: 'region', limit: 100 },
    { field: 'postalCode', limit: 20 },
    { field: 'country', limit: 100 },
  ];
  for (const { field, limit } of limits) {
    const result = checkoutSchema.safeParse({ ...validCheckout, [field]: 'x'.repeat(limit + 1) });
    assert.equal(result.success, false, field);
    if (result.success) throw new Error(`Expected ${field} length validation to fail.`);
    assert.ok(result.error.issues[0]?.message.includes(String(limit)), field);
  }
}
test('rejects malformed email addresses and oversized checkout fields', rejectsInvalidDetails);

/** Checks React Hook Form receives Zod's transformed values and field errors. No inputs.
 * @returns A promise resolving after exercising the real resolver boundary.
 */
async function resolvesFormValidation(): Promise<void> {
  const resolve = zodResolver(checkoutSchema);
  const options = { fields: {}, shouldUseNativeValidation: false };
  const accepted = await resolve(validCheckout, undefined, options);
  assert.deepEqual(accepted.errors, {});
  assert.equal(accepted.values.fullName, 'Ayşe Yılmaz');
  const rejected = await resolve({ ...validCheckout, email: 'invalid' }, undefined, options);
  assert.deepEqual(rejected.values, {});
  assert.match(rejected.errors.email?.message ?? '', /valid email/i);
}
test('uses the checkout schema through the React Hook Form Zod resolver', resolvesFormValidation);
