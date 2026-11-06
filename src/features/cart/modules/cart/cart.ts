import type { CartItem, CartProduct } from './cart.types.ts';

export const MAX_CART_QUANTITY = 99;

/**
 * Adds one available product, merging repeated additions into the same line.
 * @param items - Current cart, which remains unchanged.
 * @param product - Product snapshot to add.
 * @returns Updated cart, limited to 99 units of each product.
 */
export function addCartItem(items: CartItem[], product: CartProduct): CartItem[] {
  if (!product.inStock) return items;
  const existing = items.find(
    /** Finds a matching saved line. @param item - Cart line. @returns Whether IDs match. */
    function matchesProduct(item: CartItem): boolean {
      return item.id === product.id;
    },
  );
  if (!existing) return [...items, { ...product, quantity: 1 }];
  return items.map(
    /** Refreshes the matching snapshot and increments its quantity. @param item - Cart line. @returns Updated or original line. */
    function incrementItem(item: CartItem): CartItem {
      if (item.id !== product.id) return item;
      return { ...product, quantity: Math.min(item.quantity + 1, MAX_CART_QUANTITY) };
    },
  );
}

/**
 * Changes a cart quantity or removes a line when set to zero.
 * @param items - Current cart, which remains unchanged.
 * @param productId - Product identifier.
 * @param quantity - Whole-number quantity from zero through 99.
 * @returns Updated cart; invalid quantities leave the cart unchanged.
 */
export function setCartQuantity(
  items: CartItem[],
  productId: number,
  quantity: number,
): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_CART_QUANTITY) return items;
  if (quantity === 0) return removeCartItem(items, productId);
  return items.map(
    /** Updates the requested cart line. @param item - Cart line. @returns Updated or original line. */
    function updateItem(item: CartItem): CartItem {
      return item.id === productId ? { ...item, quantity } : item;
    },
  );
}

/** Removes a cart line. @param items - Current cart. @param productId - Product to remove. @returns Cart without that product. */
export function removeCartItem(items: CartItem[], productId: number): CartItem[] {
  return items.filter(
    /** Keeps other products. @param item - Cart line. @returns Whether this product should remain. */
    function keepItem(item: CartItem): boolean {
      return item.id !== productId;
    },
  );
}

/** Computes cart totals in integer cents. @param items - Cart lines. @returns Total units and subtotal in cents. */
export function getCartTotals(items: CartItem[]): { itemCount: number; totalCents: number } {
  let itemCount = 0;
  let totalCents = 0;
  for (const item of items) {
    itemCount += item.quantity;
    totalCents += item.priceCents * item.quantity;
  }
  return { itemCount, totalCents };
}
