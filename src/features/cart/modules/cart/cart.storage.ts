import { MAX_CART_QUANTITY } from './cart.ts';
import type { CartItem, CartSnapshot } from './cart.types.ts';

export const CART_STORAGE_KEY = 'shopboard.cart.v1';
export const CART_STORAGE_ERROR =
  'Your cart cannot be saved in this browser. It will remain available until you refresh.';

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Validates untrusted saved cart lines. @param value - Unknown saved line. @returns Whether all snapshot fields and quantity are valid. */
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isSafeInteger(value.id) &&
    'title' in value &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    'category' in value &&
    typeof value.category === 'string' &&
    value.category.trim().length > 0 &&
    'priceCents' in value &&
    typeof value.priceCents === 'number' &&
    Number.isSafeInteger(value.priceCents) &&
    value.priceCents >= 0 &&
    'inStock' in value &&
    typeof value.inStock === 'boolean' &&
    'quantity' in value &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0 &&
    value.quantity <= MAX_CART_QUANTITY
  );
}

/**
 * Reads a versioned cart, discarding malformed or duplicate saved lines.
 * @param storage - Browser-compatible storage.
 * @returns Validated cart or an empty cart; unavailable storage includes a useful error.
 */
export function loadCart(storage: CartStorage): CartSnapshot {
  let serialized: string | null;
  try {
    serialized = storage.getItem(CART_STORAGE_KEY);
  } catch {
    return { items: [], error: CART_STORAGE_ERROR };
  }
  if (serialized === null) return { items: [], error: null };
  try {
    const value: unknown = JSON.parse(serialized);
    if (
      typeof value !== 'object' ||
      value === null ||
      !('version' in value) ||
      value.version !== 1 ||
      !('items' in value) ||
      !Array.isArray(value.items)
    ) {
      return { items: [], error: null };
    }
    const items: CartItem[] = [];
    const ids = new Set<number>();
    for (const item of value.items) {
      if (!isCartItem(item) || ids.has(item.id)) return { items: [], error: null };
      ids.add(item.id);
      items.push({
        id: item.id,
        title: item.title,
        category: item.category,
        priceCents: item.priceCents,
        inStock: item.inStock,
        quantity: item.quantity,
      });
    }
    return { items, error: null };
  } catch {
    return { items: [], error: null };
  }
}

/**
 * Persists a cart snapshot, reporting access and quota failures without throwing.
 * @param storage - Browser-compatible storage.
 * @param items - Validated current cart lines.
 * @returns Null when saved, otherwise a message explaining that persistence is unavailable.
 */
export function saveCart(storage: CartStorage, items: CartItem[]): string | null {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items }));
    return null;
  } catch {
    return CART_STORAGE_ERROR;
  }
}
