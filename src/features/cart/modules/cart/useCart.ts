import { use } from 'react';
import { CartContext } from './cart.context.ts';
import type { CartState } from './cart.types.ts';

/**
 * Reads the shared cart without creating another state or storage owner. No inputs.
 * @returns The nearest provider's cart snapshot and mutation actions.
 * @throws An error when called outside CartProvider.
 */
export function useCart(): CartState {
  const cart = use(CartContext);
  if (cart === null) throw new Error('useCart must be used within CartProvider.');
  return cart;
}
