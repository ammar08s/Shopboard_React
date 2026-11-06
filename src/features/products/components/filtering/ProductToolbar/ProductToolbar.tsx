import type { ChangeEvent, ReactElement } from 'react';
import type { SortOrder } from '../../../modules/filtering/products.filters.types.ts';
import './ProductToolbar.css';

interface Props {
  matchingCount: number;
  totalCount: number;
  sort: SortOrder;
  onSortChange: (value: string) => void;
}

/**
 * Displays the result count and controlled sort selector.
 * @param props - Result counts, current sort, and sort-change callback.
 * @returns Catalog toolbar.
 */
export function ProductToolbar({
  matchingCount,
  totalCount,
  sort,
  onSortChange,
}: Props): ReactElement {
  /**
   * Forwards the selected sort value for validation and state updates.
   * @param event - Sort selector change.
   * @returns Nothing; invokes the sort-change callback.
   */
  function changeSort(event: ChangeEvent<HTMLSelectElement>): void {
    onSortChange(event.target.value);
  }

  return (
    <div className="products-toolbar">
      <p aria-live="polite">
        <strong>{matchingCount}</strong> of {totalCount} products
      </p>
      <label>
        Sort by{' '}
        <select value={sort} onChange={changeSort}>
          <option value="name">Name: A–Z</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}
