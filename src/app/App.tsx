import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AdminDashboard } from '../features/admin/components/AdminDashboard/AdminDashboard.tsx';
import { Login } from '../features/admin/components/Login/Login.tsx';
import { useDemoAuth } from '../features/admin/modules/session/useDemoAuth.ts';
import { Cart } from '../features/cart/components/Cart/Cart.tsx';
import { useCart } from '../features/cart/modules/cart/useCart.ts';
import { Products } from '../features/products/components/Products/Products.tsx';
import { ProductDetails } from '../features/products/components/details/ProductDetails/ProductDetails.tsx';
import type { Product } from '../features/products/modules/catalog/products.types.ts';
import { useProducts } from '../features/products/modules/catalog/useProducts.ts';
import { useDemoCatalog } from '../features/products/modules/demo/useDemoCatalog.ts';
import { StoreFooter } from './components/StoreFooter/StoreFooter.tsx';
import { StoreHeader } from './components/StoreHeader/StoreHeader.tsx';
import { StoreIntro } from './components/StoreIntro/StoreIntro.tsx';
import { getStorePageTitle, needsProductCatalog } from './modules/navigation/storePage.ts';
import { ToastRegion } from '../shared/components/ToastRegion/ToastRegion.tsx';
import { useToasts } from '../shared/modules/toasts/useToasts.ts';
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
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getStorePageTitle(location.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const needsCatalog = needsProductCatalog(location.pathname);
  const { state, retry } = useProducts(needsCatalog);
  const { toasts, announcement, notify, dismiss } = useToasts();
  const demo = useDemoCatalog(state.status === 'success' ? state.products : emptyProducts, notify);
  const auth = useDemoAuth();
  const cart = useCart(notify);

  /** Updates the page title and moves focus to the new main content. No inputs.
   * @returns Nothing; synchronizes the browser title and keyboard focus after navigation.
   */
  function announcePage(): void {
    document.title = `ShopBoard — ${pageTitle}`;
    mainRef.current?.focus();
  }
  useEffect(announcePage, [pageTitle, location.pathname, auth.signedIn]);

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
    if (accepted) {
      void navigate('/admin');
      notify({ variant: 'success', message: 'Signed in to the demo dashboard.' });
    } else
      notify({
        variant: 'error',
        message: 'Email or password is incorrect. Use the demo credentials shown on the page.',
      });
    return accepted;
  }

  /** Ends the demo admin session and opens login. No inputs.
   * @returns Nothing; updates authentication state and the page URL.
   */
  function logout(): void {
    auth.logout();
    void navigate('/login');
    notify({ variant: 'info', message: 'Signed out of the demo.' });
  }

  /** Starts a catalog retry with immediate feedback. No inputs.
   * @returns Nothing; publishes a retry notice and restarts the API request.
   */
  function retryCollection(): void {
    notify({ variant: 'info', message: 'Collection retry started. Loading the latest products.' });
    retry();
  }

  return (
    <>
      <a className="store-skip" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <div className="store-announcement">Good things. Everyday essentials. All in one place.</div>
      <div className="store-shell">
        <StoreHeader cartCount={cart.itemCount} signedIn={auth.signedIn} onLogout={logout} />
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={
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
                    onRetry={retryCollection}
                    onAddToCart={cart.addItem}
                  />
                </>
              }
            />
            <Route
              path="/products/:productId"
              element={<ProductDetails key={location.pathname} onAddToCart={cart.addItem} />}
            />
            <Route
              path="/cart"
              element={
                <Cart
                  items={cart.items}
                  totalCents={cart.totalCents}
                  storageError={cart.storageError}
                  onQuantityChange={cart.updateQuantity}
                  onRemove={cart.removeItem}
                  onClear={cart.clearCart}
                />
              }
            />
            <Route
              path="/login"
              element={auth.signedIn ? <Navigate to="/admin" replace /> : <Login onLogin={login} />}
            />
            <Route
              path="/admin"
              element={
                auth.signedIn ? (
                  <AdminDashboard
                    products={demo.products}
                    catalogStatus={state.status}
                    catalogError={state.status === 'error' ? state.message : null}
                    storageError={demo.storageError}
                    onRetry={retryCollection}
                    onCreate={demo.createProduct}
                    onUpdate={demo.updateProduct}
                    onDelete={demo.deleteProduct}
                    onDeleteCategory={demo.deleteCategory}
                    onNotify={notify}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="*"
              element={
                <section className="store-not-found">
                  <h1>Page not found</h1>
                  <p>This link doesn’t lead to a ShopBoard page.</p>
                  <Link to="/">Back to the collection</Link>
                </section>
              }
            />
          </Routes>
        </main>
        <StoreFooter />
      </div>
      <ToastRegion toasts={toasts} announcement={announcement} onDismiss={dismiss} />
    </>
  );
}

export default App;
