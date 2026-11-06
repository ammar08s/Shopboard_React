import type { ReactElement } from 'react';
import { ProductCardSkeleton } from '../ProductCardSkeleton/ProductCardSkeleton.tsx';
import { ProductFiltersSkeleton } from '../ProductFiltersSkeleton/ProductFiltersSkeleton.tsx';
import '../productSkeleton.css';
import './ProductLoading.css';

interface Props {
  children?: never;
}

const cardPlaceholderIds = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

/**
 * Renders a decorative card for one stable loading slot.
 * @param placeholderId - Stable identifier for the card placeholder.
 * @returns Keyed product card skeleton.
 */
function renderCardSkeleton(placeholderId: string): ReactElement {
  return <ProductCardSkeleton key={placeholderId} />;
}

/**
 * Reserves the catalog layout while announcing that its request is in progress.
 * @param props - No configurable inputs.
 * @returns Accessible loading status with decorative filter, toolbar, and card skeletons.
 */
export function ProductLoading(_props: Props): ReactElement {
  return (
    <section className="products-loading" role="status" aria-label="Loading the collection">
      <span className="products-loading-status">Loading the collection…</span>
      <div className="products-loading-layout" aria-hidden="true">
        <ProductFiltersSkeleton />
        <div className="products-loading-results">
          <div className="products-loading-toolbar">
            <span className="products-skeleton products-loading-count" />
            <span className="products-skeleton products-loading-sort" />
          </div>
          <div className="products-loading-grid">{cardPlaceholderIds.map(renderCardSkeleton)}</div>
        </div>
      </div>
    </section>
  );
}
