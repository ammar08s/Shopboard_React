import { useEffect, useRef } from 'react';
import type { MouseEvent, ReactElement } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useDemoAuth } from '../features/admin/modules/session/useDemoAuth.ts';
import type { Product } from '../features/products/modules/catalog/products.types.ts';
import { useProducts } from '../features/products/modules/catalog/useProducts.ts';
import { useDemoCatalog } from '../features/products/modules/demo/useDemoCatalog.ts';
import { StoreFooter } from './components/StoreFooter/StoreFooter.tsx';
import { StoreHeader } from './components/StoreHeader/StoreHeader.tsx';
import { CartProvider } from './components/CartProvider/CartProvider.tsx';
import { getStorePageTitle, needsProductCatalog } from './modules/navigation/storePage.ts';
import { ToastRegion } from '../shared/components/ToastRegion/ToastRegion.tsx';
import { useToasts } from '../shared/modules/toasts/useToasts.ts';
import { RetryablePage } from './components/RetryablePage/RetryablePage.tsx';
import { useProductRequestLifetime } from './modules/navigation/useProductRequestLifetime.ts';
import type { CollectionPage } from './components/CollectionPage/CollectionPage.tsx';
import type { ProductDetailsPage } from './components/ProductDetailsPage/ProductDetailsPage.tsx';
import type { Cart } from '../features/cart/components/Cart/Cart.tsx';
import type { CheckoutPage } from './components/CheckoutPage/CheckoutPage.tsx';
import type { Login } from '../features/admin/components/Login/Login.tsx';
import type { AdminPage } from './components/AdminPage/AdminPage.tsx';
import './App.css';

/** Loads collection composition only when its route renders. No inputs.
 * @returns A promise exposing the collection page as the lazy component.
 */
async function loadCollectionPage(): Promise<{ default: typeof CollectionPage }> {
  const page = await import('./components/CollectionPage/CollectionPage.tsx');
  return { default: page.CollectionPage };
}

/** Loads product details and comments only when a product route renders. No inputs.
 * @returns A promise exposing the product detail page as the lazy component.
 */
async function loadProductDetails(): Promise<{ default: typeof ProductDetailsPage }> {
  const page = await import('./components/ProductDetailsPage/ProductDetailsPage.tsx');
  return { default: page.ProductDetailsPage };
}

/** Loads cart UI only when the cart route renders. No inputs.
 * @returns A promise exposing the cart page as the lazy component.
 */
async function loadCartPage(): Promise<{ default: typeof Cart }> {
  const page = await import('../features/cart/components/Cart/Cart.tsx');
  return { default: page.Cart };
}

/** Loads checkout and its form libraries only when the checkout route renders. No inputs.
 * @returns A promise exposing checkout composition as the lazy component.
 */
async function loadCheckoutPage(): Promise<{ default: typeof CheckoutPage }> {
  const page = await import('./components/CheckoutPage/CheckoutPage.tsx');
  return { default: page.CheckoutPage };
}

/** Loads the sign-in form only when the login route renders. No inputs.
 * @returns A promise exposing the login page as the lazy component.
 */
async function loadLoginPage(): Promise<{ default: typeof Login }> {
  const page = await import('../features/admin/components/Login/Login.tsx');
  return { default: page.Login };
}

/** Loads administration UI only when its authenticated route renders. No inputs.
 * @returns A promise exposing the dashboard as the lazy component.
 */
async function loadAdminDashboard(): Promise<{ default: typeof AdminPage }> {
  const page = await import('./components/AdminPage/AdminPage.tsx');
  return { default: page.AdminPage };
}

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
  useProductRequestLifetime(location.pathname);
  const { state, retry } = useProducts(needsCatalog);
  const { toasts, announcement, notify, dismiss } = useToasts();
  const demo = useDemoCatalog(state.status === 'success' ? state.products : emptyProducts, notify);
  const auth = useDemoAuth();

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
    <CartProvider notify={notify}>
      <a className="store-skip" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <div className="store-announcement">Good things. Everyday essentials. All in one place.</div>
      <div className="store-shell">
        <StoreHeader signedIn={auth.signedIn} onLogout={logout} />
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={
                <RetryablePage
                  key={location.pathname}
                  load={loadCollectionPage}
                  pageProps={{ products: demo.products, onRetry: retryCollection }}
                />
              }
            />
            <Route
              path="/products/:productId"
              element={
                <RetryablePage key={location.pathname} load={loadProductDetails} pageProps={{}} />
              }
            />
            <Route
              path="/cart"
              element={<RetryablePage key={location.pathname} load={loadCartPage} pageProps={{}} />}
            />
            <Route
              path="/checkout"
              element={
                <RetryablePage key={location.pathname} load={loadCheckoutPage} pageProps={{}} />
              }
            />
            <Route
              path="/login"
              element={
                auth.signedIn ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <RetryablePage
                    key={location.pathname}
                    load={loadLoginPage}
                    pageProps={{ onLogin: login }}
                  />
                )
              }
            />
            <Route
              path="/admin"
              element={
                auth.signedIn ? (
                  <RetryablePage
                    key={location.pathname}
                    load={loadAdminDashboard}
                    pageProps={{
                      products: demo.products,
                      catalogStatus: state.status,
                      storageError: demo.storageError,
                      onRetry: retryCollection,
                      onCreate: demo.createProduct,
                      onUpdate: demo.updateProduct,
                      onDelete: demo.deleteProduct,
                      onDeleteCategory: demo.deleteCategory,
                      onNotify: notify,
                    }}
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
    </CartProvider>
  );
}

export default App;
