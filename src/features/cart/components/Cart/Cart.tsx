import type { ReactElement } from 'react';
import { formatCartPrice } from '../../modules/cart/cart.price.ts';
import type { CartItem } from '../../modules/cart/cart.types.ts';
import { CartLine } from '../CartLine/CartLine.tsx';
import './Cart.css';

interface Props {
  items: CartItem[];
  totalCents: number;
  storageError: string | null;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
}

/** Displays the persistent demo cart and its empty state. @param props - Cart state, subtotal, persistence feedback, and mutation callbacks. @returns Accessible cart section. */
export function Cart({
  items,
  totalCents,
  storageError,
  onQuantityChange,
  onRemove,
  onClear,
}: Props): ReactElement {
  /** Displays one keyed cart line. @param item - Saved cart line. @returns Cart list item. */
  function renderLine(item: CartItem): ReactElement {
    return (
      <CartLine key={item.id} item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} />
    );
  }

  return (
    <section id="cart" className="cart-section" aria-labelledby="cart-heading">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">YOUR GOOD FINDS</p>
          <h2 id="cart-heading">
            Your cart<span>.</span>
          </h2>
        </div>
        {items.length > 0 ? (
          <button type="button" className="cart-clear" onClick={onClear}>
            Clear cart
          </button>
        ) : null}
      </div>
      {storageError ? <p className="cart-storage-error">{storageError}</p> : null}
      {items.length === 0 ? (
        <div className="cart-empty">
          <h3>A little room for something good.</h3>
          <p>Your cart is empty. Find an everyday essential in the collection.</p>
          <a href="#collection">
            Explore the collection <span aria-hidden="true">↗</span>
          </a>
        </div>
      ) : (
        <>
          <ul className="cart-items">{items.map(renderLine)}</ul>
          <div className="cart-summary">
            <p>
              {storageError
                ? 'Your cart is available for this visit.'
                : 'Saved in this browser for your next visit.'}
            </p>
            <div className="cart-subtotal" aria-live="polite" aria-atomic="true">
              <span>
                Subtotal <small>USD</small>
              </span>
              <strong>{formatCartPrice(totalCents)}</strong>
            </div>
          </div>
        </>
      )}
      <p className="cart-demo-note">Demo cart · No orders or payments are placed.</p>
    </section>
  );
}
