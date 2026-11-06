import type { ReactElement } from 'react';
import '../productSkeleton.css';
import './ProductCardSkeleton.css';

interface Props {
  children?: never;
}

/**
 * Reserves the image, metadata, title, and price areas of a product card.
 * @param props - No configurable inputs.
 * @returns A decorative, non-interactive product card placeholder.
 */
export function ProductCardSkeleton(_props: Props): ReactElement {
  return (
    <div className="products-card-skeleton" aria-hidden="true">
      <div className="products-skeleton products-card-skeleton-art" />
      <div className="products-card-skeleton-body">
        <div className="products-card-skeleton-meta">
          <span className="products-skeleton products-card-skeleton-category" />
          <span className="products-skeleton products-card-skeleton-stock" />
        </div>
        <span className="products-skeleton products-card-skeleton-title" />
        <span className="products-skeleton products-card-skeleton-price" />
      </div>
    </div>
  );
}
