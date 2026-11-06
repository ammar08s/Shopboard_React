import type { ReactElement } from 'react';
import '../productFeedback.css';

interface Props {
  totalCount: number;
  onReset: () => void;
}

/**
 * Distinguishes an empty catalog from filters with no matching products.
 * @param props - Full catalog count and filter-reset callback.
 * @returns Empty-result feedback and a reset action when products exist.
 */
export function ProductEmptyState({ totalCount, onReset }: Props): ReactElement {
  return (
    <div className="products-message">
      <span className="ui-eyebrow">A fresh start</span>
      <h2>{totalCount === 0 ? 'The shelves are quiet.' : 'No matches just yet.'}</h2>
      <p>
        {totalCount === 0
          ? 'Check back soon for new products.'
          : 'Try another search or clear your filters to see the full collection.'}
      </p>
      {totalCount > 0 ? (
        <button className="products-button" type="button" onClick={onReset}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
