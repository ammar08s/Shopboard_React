import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { formatCartPrice } from '../../modules/cart/cart.price.ts';
import type { CartItem } from '../../modules/cart/cart.types.ts';
import { useCart } from '../../modules/cart/useCart.ts';
import { CartLine } from '../CartLine/CartLine.tsx';
import './Cart.css';

interface Props {
  children?: never;
}

/** Displays the provider-owned demo cart and its empty state. @param props - No configurable inputs. @returns Accessible cart section. */
export function Cart(_props: Props): ReactElement {
  const { items, totalCents, storageError, updateQuantity, removeItem, clearCart } = useCart();
  /** Displays one keyed cart line. @param item - Saved cart line. @returns Cart list item. */
  function renderLine(item: CartItem): ReactElement {
    return (
      <CartLine key={item.id} item={item} onQuantityChange={updateQuantity} onRemove={removeItem} />
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
          <button type="button" className="cart-clear" onClick={clearCart}>
            Clear cart
          </button>
        ) : null}
      </div>
      {storageError ? <p className="cart-storage-error">{storageError}</p> : null}
      {items.length === 0 ? (
        <div className="cart-empty">
          <h3>A little room for something good.</h3>
          <p>Your cart is empty. Find an everyday essential in the collection.</p>
          <Link to="/">
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
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
          <Link className="cart-checkout" to="/checkout">
            Continue to checkout <span aria-hidden="true">↗</span>
          </Link>
        </>
      )}
      <p className="cart-demo-note">Demo cart · No orders or payments are placed.</p>
    </section>
  );
}
