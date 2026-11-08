import type { ReactElement } from 'react';
import { Link } from 'react-router';
import type { CheckoutItem } from '../../modules/summary/checkout.types.ts';
import { formatCheckoutPrice } from '../../modules/summary/checkout.price.ts';
import './CheckoutSummary.css';

interface Props {
  items: CheckoutItem[];
  totalCents: number;
}

/** Displays the current shared cart without duplicating its items or calculated total in state.
 * @param props - Current cart lines and the cart provider's derived total.
 * @returns The checkout order summary and an edit-cart link.
 */
export function CheckoutSummary({ items, totalCents }: Props): ReactElement {
  /** Renders one saved product and its derived line price.
   * @param item - Current cart line.
   * @returns A keyed summary list item.
   */
  function renderItem(item: CheckoutItem): ReactElement {
    return (
      <li key={item.id}>
        <div>
          <span>{item.title}</span>
          <small>Quantity {item.quantity}</small>
        </div>
        <strong>{formatCheckoutPrice(item.priceCents * item.quantity)}</strong>
      </li>
    );
  }
  return (
    <aside className="checkout-summary" aria-labelledby="checkout-summary-heading">
      <div className="checkout-summary-heading">
        <h2 id="checkout-summary-heading">Your good finds</h2>
        <Link to="/cart">Edit cart</Link>
      </div>
      <ul>{items.map(renderItem)}</ul>
      <div className="checkout-summary-total">
        <span>
          Demo total <small>USD</small>
        </span>
        <strong>{formatCheckoutPrice(totalCents)}</strong>
      </div>
      <p>Delivery and payment are simulated. You won’t be charged.</p>
    </aside>
  );
}
