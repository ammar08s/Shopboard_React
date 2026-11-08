import type { ReactElement } from 'react';
import { Link } from 'react-router';
import './ProductDetailsLoading.css';

interface Props {
  children?: never;
}

/** Keeps detail loading local while navigation and the surrounding shell remain usable.
 * @param props - No configurable inputs.
 * @returns One announced loading state and decorative product placeholders.
 */
export function ProductDetailsLoading(_props: Props): ReactElement {
  return (
    <section className="products-detail-loading">
      <Link to="/">&larr; Back to the collection</Link>
      <p role="status">Loading product details…</p>
      <div className="products-detail-loading-grid" aria-hidden="true">
        <div />
        <div />
      </div>
    </section>
  );
}
