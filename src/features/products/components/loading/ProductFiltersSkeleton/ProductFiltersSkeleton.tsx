import type { ReactElement } from 'react';
import '../productSkeleton.css';
import './ProductFiltersSkeleton.css';

interface Props {
  children?: never;
}

const categoryPlaceholderIds = [
  'all-categories',
  'first-category',
  'second-category',
  'third-category',
];

/**
 * Reserves a category choice without creating an interactive form control.
 * @param placeholderId - Stable identifier for the category placeholder.
 * @returns Decorative category-choice shapes.
 */
function renderCategorySkeleton(placeholderId: string): ReactElement {
  return (
    <div className="products-filters-skeleton-option" key={placeholderId}>
      <span className="products-skeleton products-filters-skeleton-radio" />
      <span className="products-skeleton products-filters-skeleton-option-label" />
    </div>
  );
}

/**
 * Reserves the catalog's search and filter areas while product data loads.
 * @param props - No configurable inputs.
 * @returns A decorative responsive filter sidebar without focusable controls.
 */
export function ProductFiltersSkeleton(_props: Props): ReactElement {
  return (
    <div className="products-filters-skeleton" aria-hidden="true">
      <div className="products-filters-skeleton-heading">
        <span className="products-skeleton products-filters-skeleton-heading-label" />
        <span className="products-skeleton products-filters-skeleton-reset" />
      </div>
      <span className="products-skeleton products-filters-skeleton-search-label" />
      <span className="products-skeleton products-filters-skeleton-search" />
      <div className="products-filters-skeleton-group">
        <span className="products-skeleton products-filters-skeleton-legend" />
        {categoryPlaceholderIds.map(renderCategorySkeleton)}
      </div>
      <div className="products-filters-skeleton-group">
        <span className="products-skeleton products-filters-skeleton-legend" />
        <div className="products-filters-skeleton-option">
          <span className="products-skeleton products-filters-skeleton-checkbox" />
          <span className="products-skeleton products-filters-skeleton-option-label" />
        </div>
      </div>
    </div>
  );
}
