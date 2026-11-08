import { useRef, useState } from 'react';
import {
  addCartItem,
  getCartTotals,
  removeCartItem,
  setCartQuantity,
  MAX_CART_QUANTITY,
} from './cart.ts';
import type { Notify, ToastInput } from '../../../../shared/modules/toasts/toasts.types.ts';
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

/** Manages cart state and reports user-triggered mutation outcomes.
 * @param notify - Application notification callback.
 * @returns Cart, derived totals, persistence feedback, and mutation actions.
 */
export function useCart(notify: Notify): CartActions {
  const [cart, setCart] = useState(loadInitialCart);
  const latestItems = useRef(cart.items);
  const { items, error: storageError } = cart;
  const { itemCount, totalCents } = getCartTotals(items);

  /** Saves a cart change and reports its actual persistence outcome.
   * @param nextItems - Next cart snapshot.
   * @param notification - Feedback for the completed in-memory change.
   * @returns Nothing; storage failures keep the cart usable and produce a persistent error notification.
   */
  function commitCart(nextItems: CartItem[], notification: ToastInput): void {
    let error: string | null;
    try {
      error = saveCart(window.localStorage, nextItems);
    } catch {
      error = CART_STORAGE_ERROR;
    }
    latestItems.current = nextItems;
    setCart({ items: nextItems, error });
    notify(
      error === null
        ? notification
        : { ...notification, variant: 'error', message: `${notification.message} ${error}` },
    );
  }

  /** Finds the latest cart snapshot for a user action.
   * @param productId - Product identifier.
   * @returns Current cart line, or undefined if it has already been removed.
   */
  function findItem(productId: number): CartItem | undefined {
    /** Matches the action to a saved cart line.
     * @param item - Current cart line.
     * @returns Whether the product IDs match.
     */
    function matchesProduct(item: CartItem): boolean {
      return item.id === productId;
    }
    return latestItems.current.find(matchesProduct);
  }

  /** Adds an available product to the cart. @param product - Product snapshot. @returns Nothing. */
  function addItem(product: CartProduct): void {
    if (!product.inStock) {
      notify({ variant: 'error', message: `${product.title} is out of stock.` });
      return;
    }
    const existing = findItem(product.id);
    if (existing !== undefined && existing.quantity >= MAX_CART_QUANTITY) {
      notify({
        variant: 'info',
        message: `Your cart already has the maximum of ${MAX_CART_QUANTITY} units of ${product.title}.`,
        action: { label: 'View cart', href: '#cart' },
      });
      return;
    }
    commitCart(addCartItem(latestItems.current, product), {
      variant: 'success',
      message: `${product.title} added to your cart.`,
      action: { label: 'View cart', href: '#cart' },
    });
  }

  /** Changes a cart line quantity. @param productId - Product identifier. @param quantity - Desired whole-number quantity. @returns Nothing. */
  function updateQuantity(productId: number, quantity: number): void {
    const item = findItem(productId);
    if (item === undefined) return;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_CART_QUANTITY) {
      notify({
        variant: 'error',
        message: `Choose a whole-number quantity from 1 to ${MAX_CART_QUANTITY}.`,
      });
      return;
    }
    if (quantity === item.quantity) return;
    const message =
      quantity === 0
        ? `${item.title} removed from your cart.`
        : `${item.title} quantity updated to ${quantity}.`;
    commitCart(setCartQuantity(latestItems.current, productId, quantity), {
      variant: 'success',
      message,
    });
  }

  /** Removes a product from the cart. @param productId - Product identifier. @returns Nothing. */
  function removeItem(productId: number): void {
    const item = findItem(productId);
    if (item === undefined) return;
    commitCart(removeCartItem(latestItems.current, productId), {
      variant: 'success',
      message: `${item.title} removed from your cart.`,
    });
  }

  /** Removes all cart lines. No inputs. @returns Nothing. */
  function clearCart(): void {
    if (latestItems.current.length === 0) return;
    commitCart([], { variant: 'success', message: 'Your cart has been cleared.' });
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
