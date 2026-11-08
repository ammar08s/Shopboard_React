import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { PageLoadError } from './components/PageLoadError/PageLoadError.tsx';

/** Defers a page import and keeps failures inside the route's existing shell.
 * @param load - Module loader called only when React first renders the page.
 * @returns A lazy component preserving the page's props, or reload feedback if its import fails.
 */
export function lazyPage<PageProps extends object>(
  load: () => Promise<{ default: ComponentType<PageProps> }>,
): LazyExoticComponent<ComponentType<PageProps>> {
  /** Resolves the page without letting a rejected import remove the application. No inputs.
   * @returns The requested component, or a fallback that ignores forwarded page props.
   */
  async function loadWithFallback(): Promise<{ default: ComponentType<PageProps> }> {
    try {
      return await load();
    } catch {
      return { default: PageLoadError };
    }
  }
  return lazy(loadWithFallback);
}
