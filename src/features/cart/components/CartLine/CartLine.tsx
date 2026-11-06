import type { ReactElement } from 'react';
import { MAX_CART_QUANTITY } from '../../modules/cart/cart.ts';
import { formatCartPrice } from '../../modules/cart/cart.price.ts';
import type { CartItem } from '../../modules/cart/cart.types.ts';
import './CartLine.css';

interface Props {
  item: CartItem;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

/** Renders one cart line with accessible quantity and removal controls. @param props - Cart line and mutation callbacks. @returns Cart list item. */
export function CartLine({ item, onQuantityChange, onRemove }: Props): ReactElement {
  /** Decreases this line by one unit. No inputs. @returns Nothing. */
  function decreaseQuantity(): void {
    onQuantityChange(item.id, item.quantity - 1);
  }
  /** Increases this line by one unit. No inputs. @returns Nothing. */
  function increaseQuantity(): void {
    onQuantityChange(item.id, item.quantity + 1);
  }
  /** Removes this line. No inputs. @returns Nothing. */
  function removeItem(): void {
    onRemove(item.id);
  }

  return (
    <li className="cart-line">
      <div className="cart-line-art" aria-hidden="true">
        {item.title.charAt(0)}
      </div>
      <div className="cart-line-details">
        <span className="cart-line-category">{item.category}</span>
        <h3>{item.title}</h3>
        <span className="cart-line-unit-price">{formatCartPrice(item.priceCents)} each</span>
      </div>
      <div className="cart-line-controls">
        <div className="cart-line-quantity" role="group" aria-label={`Quantity for ${item.title}`}>
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.title}`}
          >
            −
          </button>
          <span aria-live="polite" aria-atomic="true">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={increaseQuantity}
            disabled={item.quantity >= MAX_CART_QUANTITY}
            aria-label={`Increase quantity of ${item.title}`}
          >
            +
          </button>
        </div>
        <button
          className="cart-line-remove"
          type="button"
          onClick={removeItem}
          aria-label={`Remove ${item.title} from cart`}
        >
          Remove
        </button>
      </div>
      <strong className="cart-line-total">
        {formatCartPrice(item.priceCents * item.quantity)}
      </strong>
    </li>
  );
}
