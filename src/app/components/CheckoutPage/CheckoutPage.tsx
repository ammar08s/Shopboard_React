import type { ReactElement } from 'react';
import { useCart } from '../../../features/cart/modules/cart/useCart.ts';
import { Checkout } from '../../../features/checkout/components/Checkout/Checkout.tsx';

interface Props {
  children?: never;
}

/** Connects the checkout route to the cart while preserving independent feature contracts.
 * @param props - No configurable inputs.
 * @returns Checkout with shared cart data and the provider's clear action.
 */
export function CheckoutPage(_props: Props): ReactElement {
  const { items, totalCents, storageError, clearCart } = useCart();
  return (
    <Checkout
      items={items}
      totalCents={totalCents}
      storageError={storageError}
      onComplete={clearCart}
    />
  );
}
