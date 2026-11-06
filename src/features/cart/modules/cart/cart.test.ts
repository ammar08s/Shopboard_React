import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addCartItem, getCartTotals, removeCartItem, setCartQuantity } from './cart.ts';
import { loadCart, saveCart } from './cart.storage.ts';

const product = { id: 1, title: 'Canvas tote', category: 'Bags', priceCents: 1299, inStock: true };

/** Verifies duplicate additions share one line without mutating the previous cart. No inputs. @returns Nothing. */
function combinesRepeatedProducts(): void {
  const first = addCartItem([], product);
  const second = addCartItem(first, product);
  assert.equal(first[0]?.quantity, 1);
  assert.equal(second.length, 1);
  assert.equal(second[0]?.quantity, 2);
  assert.deepEqual(getCartTotals(second), { itemCount: 2, totalCents: 2598 });
}
test('combines repeated additions and calculates integer-cent totals', combinesRepeatedProducts);

/** Verifies unavailable products and invalid quantities cannot enter the cart. No inputs. @returns Nothing. */
function respectsAvailabilityAndLimits(): void {
  assert.deepEqual(addCartItem([], { ...product, inStock: false }), []);
  const items = addCartItem([], product);
  assert.equal(setCartQuantity(items, 1, 99)[0]?.quantity, 99);
  assert.equal(addCartItem(setCartQuantity(items, 1, 99), product)[0]?.quantity, 99);
  assert.deepEqual(setCartQuantity(items, 1, NaN), items);
  assert.deepEqual(setCartQuantity(items, 1, 1.5), items);
  assert.deepEqual(setCartQuantity(items, 1, 100), items);
  assert.deepEqual(setCartQuantity(items, 1, 0), []);
  assert.deepEqual(removeCartItem(items, 1), []);
}
test(
  'prevents unavailable additions, caps quantities, and removes lines',
  respectsAvailabilityAndLimits,
);

/** Verifies the cart survives serialization and malformed data is discarded. No inputs. @returns Nothing. */
function validatesStoredCart(): void {
  let saved: string | null = null;
  const storage = {
    /** Reads the test cart. @param key - Requested storage key. @returns Saved serialized cart. */
    getItem(_key: string): string | null {
      return saved;
    },
    /** Saves the test cart. @param key - Target storage key. @param value - Serialized cart. @returns Nothing. */
    setItem(_key: string, value: string): void {
      saved = value;
    },
  };
  const items = addCartItem([], product);
  assert.equal(saveCart(storage, items), null);
  assert.deepEqual(loadCart(storage), { items, error: null });
  saved = '{broken';
  assert.deepEqual(loadCart(storage).items, []);
  saved = JSON.stringify({ version: 1, items: [{ ...product, quantity: -2 }] });
  assert.deepEqual(loadCart(storage).items, []);
  saved = JSON.stringify({ version: 2, items });
  assert.deepEqual(loadCart(storage).items, []);
  saved = JSON.stringify({ version: 1, items: [items[0], items[0]] });
  assert.deepEqual(loadCart(storage).items, []);
}
test(
  'round-trips valid carts and rejects malformed, unsupported, or duplicate saved lines',
  validatesStoredCart,
);

/** Verifies denied browser storage leaves usable cart state and reports persistence failure. No inputs. @returns Nothing. */
function handlesBlockedStorage(): void {
  const storage = {
    /** Simulates unavailable storage. @param key - Requested key. @returns Never; throws denied access. */
    getItem(_key: string): never {
      throw new Error('Denied');
    },
    /** Simulates unavailable storage. @param key - Target key. @param value - Serialized data. @returns Never; throws denied access. */
    setItem(_key: string, _value: string): never {
      throw new Error('Denied');
    },
  };
  assert.deepEqual(loadCart(storage).items, []);
  assert.match(loadCart(storage).error ?? '', /saved/);
  assert.match(saveCart(storage, []) ?? '', /saved/);
}
test('handles storage access and quota failures without throwing', handlesBlockedStorage);
