import type { ReactElement } from 'react';
import type { StorePage } from '../../modules/navigation/storePage.ts';

import './StoreHeader.css';

interface Props {
  page: StorePage;
  cartCount: number;
  signedIn: boolean;
  onLogout: () => void;
}

/** Displays store identity and navigation with cart and demo session controls. @param props - Current page, cart quantity, demo session, and logout action. @returns Store header. */
export function StoreHeader({ page, cartCount, signedIn, onLogout }: Props): ReactElement {
  return (
    <header className="store-header">
      <a className="store-brand" href="#collection" aria-label="ShopBoard home">
        <span className="store-logo" aria-hidden="true">
          s.
        </span>
        shopboard<span className="store-brand-dot">®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#collection" aria-current={page === 'collection' ? 'page' : undefined}>
          The collection <span aria-hidden="true">↗</span>
        </a>
        <a href="#cart" aria-current={page === 'cart' ? 'page' : undefined}>
          Cart <span className="store-cart-count">{cartCount}</span>
        </a>
        <a
          href={signedIn ? '#admin' : '#login'}
          aria-current={page === 'admin' ? 'page' : undefined}
        >
          {signedIn ? 'Dashboard' : 'Admin login'}
        </a>
        {signedIn ? (
          <button type="button" onClick={onLogout}>
            Sign out
          </button>
        ) : null}
      </nav>
    </header>
  );
}
