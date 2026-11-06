export type StorePage = 'collection' | 'cart' | 'admin';

/** Reads the current static-host-friendly page from the URL fragment. No inputs.
 * @returns The collection, cart, or admin page; unknown fragments fall back to the collection.
 */
export function getStorePage(): StorePage {
  if (window.location.hash === '#cart') return 'cart';
  if (window.location.hash === '#admin' || window.location.hash === '#login') return 'admin';
  return 'collection';
}

/** Subscribes React to browser navigation, including back/forward history.
 * @param onChange - React callback to check the page snapshot.
 * @returns Cleanup that removes the navigation listener.
 */
export function subscribeToStorePage(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  /** Removes the navigation listener. No inputs.
   * @returns Nothing; detaches the browser event listener.
   */
  function unsubscribe(): void {
    window.removeEventListener('hashchange', onChange);
  }
  return unsubscribe;
}
