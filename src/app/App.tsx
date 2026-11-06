import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { AdminDashboard } from '../features/admin/components/AdminDashboard/AdminDashboard.tsx';
import { Login } from '../features/admin/components/Login/Login.tsx';
import { useDemoAuth } from '../features/admin/modules/session/useDemoAuth.ts';
import { Cart } from '../features/cart/components/Cart/Cart.tsx';
import { useCart } from '../features/cart/modules/cart/useCart.ts';
import { Products } from '../features/products/components/Products/Products.tsx';
import type { Product } from '../features/products/modules/catalog/products.types.ts';
import { useProducts } from '../features/products/modules/catalog/useProducts.ts';
import { useDemoCatalog } from '../features/products/modules/demo/useDemoCatalog.ts';
import { StoreFooter } from './components/StoreFooter/StoreFooter.tsx';
import { StoreHeader } from './components/StoreHeader/StoreHeader.tsx';
import { StoreIntro } from './components/StoreIntro/StoreIntro.tsx';
import { getStorePage, subscribeToStorePage } from './modules/navigation/storePage.ts';
import './App.css';

interface Props {
  children?: never;
}

const emptyProducts: Product[] = [];

/**
 * Coordinates storefront, local demo administration, and the persistent cart.
 * @param props - No configurable inputs.
 * @returns Store application.
 */
function App(_props: Props): ReactElement {
  const page = useSyncExternalStore(subscribeToStorePage, getStorePage);
  const mainRef = useRef<HTMLElement>(null);
  const { state, retry } = useProducts();
  const demo = useDemoCatalog(state.status === 'success' ? state.products : emptyProducts);
  const auth = useDemoAuth();
  const cart = useCart();

  /** Updates the page title and moves focus to the new main content. No inputs.
   * @returns Nothing; synchronizes the browser title and keyboard focus after navigation.
   */
  function announcePage(): void {
    const titles = {
      collection: 'Everyday essentials',
      cart: 'Your cart',
      admin: 'Demo administration',
    };
    document.title = `ShopBoard — ${titles[page]}`;
    mainRef.current?.focus();
  }
  useEffect(announcePage, [page, auth.signedIn]);

  /** Focuses the current page content without changing its navigation fragment.
   * @param event - Skip-link activation.
   * @returns Nothing; prevents a route change and focuses main content.
   */
  function skipToContent(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    mainRef.current?.focus();
  }

  /** Attempts the simulated admin login and opens the dashboard on success.
   * @param email - Submitted demo email.
   * @param password - Submitted demo password.
   * @returns Whether the supplied demo credentials matched.
   */
  function login(email: string, password: string): boolean {
    const accepted = auth.login(email, password);
    if (accepted) window.location.hash = 'admin';
    return accepted;
  }

  /** Ends the demo admin session and opens login. No inputs.
   * @returns Nothing; updates authentication state and the page URL.
   */
  function logout(): void {
    auth.logout();
    window.location.hash = 'login';
  }

  let content: ReactElement;
  if (page === 'cart') {
    content = (
      <Cart
        items={cart.items}
        totalCents={cart.totalCents}
        storageError={cart.storageError}
        onQuantityChange={cart.updateQuantity}
        onRemove={cart.removeItem}
        onClear={cart.clearCart}
      />
    );
  } else if (page === 'admin') {
    content = auth.signedIn ? (
      <AdminDashboard
        products={demo.products}
        catalogStatus={state.status}
        catalogError={state.status === 'error' ? state.message : null}
        storageError={demo.storageError}
        onRetry={retry}
        onCreate={demo.createProduct}
        onUpdate={demo.updateProduct}
        onDelete={demo.deleteProduct}
      />
    ) : (
      <Login onLogin={login} />
    );
  } else {
    content = (
      <>
        <StoreIntro />
        <div id="collection" className="store-collection-heading">
          <h2>
            The collection<span>.</span>
          </h2>
          <span>YOUR NEXT GOOD FIND STARTS HERE</span>
        </div>
        <Products
          state={state}
          products={demo.products}
          onRetry={retry}
          onAddToCart={cart.addItem}
        />
      </>
    );
  }

  return (
    <>
      <a className="store-skip" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <div className="store-announcement">Good things. Everyday essentials. All in one place.</div>
      <div className="store-shell">
        <StoreHeader
          page={page}
          cartCount={cart.itemCount}
          signedIn={auth.signedIn}
          onLogout={logout}
        />
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {content}
        </main>
        <StoreFooter />
      </div>
    </>
  );
}

export default App;
