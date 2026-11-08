import type { ReactElement, ReactNode } from 'react';
import { CartContext } from '../../../features/cart/modules/cart/cart.context.ts';
import { useCartState } from '../../../features/cart/modules/cart/useCartState.ts';
import type { Notify } from '../../../shared/modules/toasts/toasts.types.ts';

interface Props {
  children: ReactNode;
  notify: Notify;
}

/**
 * Owns one persistent cart shared by the shell and every route.
 * @param props - Descendant UI and the application notification callback.
 * @returns A cart context provider that remains mounted during route loading.
 */
export function CartProvider({ children, notify }: Props): ReactElement {
  const cart = useCartState(notify);
  return <CartContext value={cart}>{children}</CartContext>;
}
