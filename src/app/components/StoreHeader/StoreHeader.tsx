import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router';
import { useCart } from '../../../features/cart/modules/cart/useCart.ts';

import './StoreHeader.css';

interface Props {
  signedIn: boolean;
  onLogout: () => void;
}

/** Displays navigation with the shared cart count and demo session controls. @param props - Demo session and logout action. @returns Store header. */
export function StoreHeader({ signedIn, onLogout }: Props): ReactElement {
  const { itemCount } = useCart();
  return (
    <header className="store-header">
      <Link className="store-brand" to="/" aria-label="ShopBoard home">
        <span className="store-logo" aria-hidden="true">
          s.
        </span>
        shopboard<span className="store-brand-dot">®</span>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          The collection <span aria-hidden="true">↗</span>
        </NavLink>
        <NavLink to="/cart">
          Cart <span className="store-cart-count">{itemCount}</span>
        </NavLink>
        <NavLink to={signedIn ? '/admin' : '/login'}>
          {signedIn ? 'Dashboard' : 'Admin login'}
        </NavLink>
        {signedIn ? (
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        ) : null}
      </nav>
    </header>
  );
}
