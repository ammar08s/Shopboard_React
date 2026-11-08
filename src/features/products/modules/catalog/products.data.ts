import type { Product } from './products.types.ts';

/** Validates and maps backend products. @param payload - Untrusted response. @returns Validated products. @throws Error for malformed responses. */
export function parseProducts(payload: unknown): Product[] {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('items' in payload) ||
    !Array.isArray(payload.items) ||
    !('total' in payload) ||
    typeof payload.total !== 'number'
  ) {
    throw new Error('The store returned an unexpected response. Please try again.');
  }
  return payload.items.map(parseProduct);
}

/** Validates one product. @param value - Unknown item. @returns Frontend product. @throws Error for invalid fields. */
export function parseProduct(value: unknown): Product {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'number' ||
    !Number.isSafeInteger(value.id) ||
    !('title' in value) ||
    typeof value.title !== 'string' ||
    !('category_name' in value) ||
    typeof value.category_name !== 'string' ||
    !('price_cents' in value) ||
    typeof value.price_cents !== 'number' ||
    !Number.isSafeInteger(value.price_cents) ||
    value.price_cents < 0 ||
    !('in_stock' in value) ||
    typeof value.in_stock !== 'boolean'
  ) {
    throw new Error('A product has invalid information. Please try again.');
  }
  return {
    id: value.id,
    title: value.title,
    category: value.category_name,
    priceCents: value.price_cents,
    inStock: value.in_stock,
  };
}
