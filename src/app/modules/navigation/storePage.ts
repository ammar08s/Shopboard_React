import { matchPath } from 'react-router';

/** Names the current route for the application document title.
 * @param pathname - React Router's current URL pathname.
 * @returns A descriptive page title, including a fallback for unmatched routes.
 */
export function getStorePageTitle(pathname: string): string {
  if (matchPath('/', pathname) !== null) return 'Everyday essentials';
  if (matchPath('/cart', pathname) !== null) return 'Your cart';
  if (matchPath('/checkout', pathname) !== null) return 'Checkout';
  if (matchPath('/login', pathname) !== null) return 'Admin login';
  if (matchPath('/admin', pathname) !== null) return 'Demo administration';
  if (matchPath('/products/:productId', pathname) !== null) return 'Product details';
  return 'Page not found';
}

/** Identifies routes that consume the collection using React Router's own matching rules.
 * @param pathname - Current browser pathname, including its original case and trailing slashes.
 * @returns Whether the collection or admin route needs catalog data.
 */
export function needsProductCatalog(pathname: string): boolean {
  return matchPath('/', pathname) !== null || matchPath('/admin', pathname) !== null;
}
