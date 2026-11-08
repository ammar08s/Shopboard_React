import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router';

import './StoreHeader.css';

interface Props {
  cartCount: number;
  signedIn: boolean;
  onLogout: () => void;
}

/** Displays store identity and router navigation with cart and demo session controls. @param props - Cart quantity, demo session, and logout action. @returns Store header. */
export function StoreHeader({ cartCount, signedIn, onLogout }: Props): ReactElement {
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
          Cart <span className="store-cart-count">{cartCount}</span>
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
