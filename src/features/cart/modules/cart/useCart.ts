import { useRef, useState } from 'react';
import { addCartItem, getCartTotals, removeCartItem, setCartQuantity } from './cart.ts';
import { CART_STORAGE_ERROR, loadCart, saveCart } from './cart.storage.ts';
import type { CartItem, CartProduct, CartSnapshot } from './cart.types.ts';

interface CartActions {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  storageError: string | null;
  addItem: (product: CartProduct) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

/** Reads the initial browser cart safely. No inputs. @returns Validated cart or an empty cart when browser storage is blocked. */
function loadInitialCart(): CartSnapshot {
  try {
    return loadCart(window.localStorage);
  } catch {
    return { items: [], error: CART_STORAGE_ERROR };
  }
}

/** Manages cart state and synchronizes it with browser localStorage. No inputs. @returns Cart, derived totals, persistence feedback, and mutation actions. */
export function useCart(): CartActions {
  const [cart, setCart] = useState(loadInitialCart);
  const latestItems = useRef(cart.items);
  const { items, error: storageError } = cart;
  const { itemCount, totalCents } = getCartTotals(items);

  /** Saves a user-triggered cart change and its persistence feedback. @param nextItems - Next cart snapshot. @returns Nothing; storage failures leave the cart usable in memory. */
  function commitCart(nextItems: CartItem[]): void {
    let error: string | null;
    try {
      error = saveCart(window.localStorage, nextItems);
    } catch {
      error = CART_STORAGE_ERROR;
    }
    latestItems.current = nextItems;
    setCart({ items: nextItems, error });
  }

  /** Adds an available product to the cart. @param product - Product snapshot. @returns Nothing. */
  function addItem(product: CartProduct): void {
    commitCart(addCartItem(latestItems.current, product));
  }

  /** Changes a cart line quantity. @param productId - Product identifier. @param quantity - Desired whole-number quantity. @returns Nothing. */
  function updateQuantity(productId: number, quantity: number): void {
    commitCart(setCartQuantity(latestItems.current, productId, quantity));
  }

  /** Removes a product from the cart. @param productId - Product identifier. @returns Nothing. */
  function removeItem(productId: number): void {
    commitCart(removeCartItem(latestItems.current, productId));
  }

  /** Removes all cart lines. No inputs. @returns Nothing. */
  function clearCart(): void {
    commitCart([]);
  }

  return {
    items,
    itemCount,
    totalCents,
    storageError,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
