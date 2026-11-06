import type { ChangeEvent, ReactElement } from 'react';
import type { ProductFilters as Filters } from '../../modules/filtering/products.filters.types.ts';

import './ProductFilters.css';

interface Props {
  filters: Filters;
  categories: string[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

/** Offers catalog search and filters. @param props - Filter state and actions. @returns Filter sidebar. */
export function ProductFilters({ filters, categories, onChange, onReset }: Props): ReactElement {
  /** Updates search text. @param event - Input change. @returns Nothing. */
  function search(event: ChangeEvent<HTMLInputElement>): void {
    onChange({ ...filters, query: event.target.value });
  }
  /** Updates stock filtering. @param event - Checkbox change. @returns Nothing. */
  function changeStock(event: ChangeEvent<HTMLInputElement>): void {
    onChange({ ...filters, stockOnly: event.target.checked });
  }
  /** Selects a category. @param event - Radio selection. @returns Nothing. */
  function changeCategory(event: ChangeEvent<HTMLInputElement>): void {
    onChange({ ...filters, category: event.target.value });
  }
  /** Renders a category choice. @param category - Category label. @returns Radio label. */
  function renderCategory(category: string): ReactElement {
    return (
      <label className="products-category" key={category}>
        <input
          type="radio"
          name="category"
          value={category}
          checked={filters.category === category}
          onChange={changeCategory}
        />
        <span>{category}</span>
      </label>
    );
  }
  return (
    <aside className="products-filters" aria-label="Product filters">
      <div className="products-filter-heading">
        <h2>Refine your find</h2>
        <button type="button" className="products-text-button" onClick={onReset}>
          Reset
        </button>
      </div>
      <label className="products-field" htmlFor="product-search">
        Search products
      </label>
      <input
        id="product-search"
        className="products-search"
        type="search"
        placeholder="Find something good…"
        value={filters.query}
        onChange={search}
      />
      <fieldset>
        <legend>Category</legend>
        <label className="products-category">
          <input
            type="radio"
            name="category"
            value=""
            checked={filters.category === ''}
            onChange={changeCategory}
          />
          <span>All products</span>
        </label>
        {categories.map(renderCategory)}
      </fieldset>
      <fieldset>
        <legend>Availability</legend>
        <label className="products-category">
          <input type="checkbox" checked={filters.stockOnly} onChange={changeStock} />
          <span>In stock only</span>
        </label>
      </fieldset>
      <p className="products-sidebar-note">
        A little less scrolling.
        <br />A little more finding.
      </p>
    </aside>
  );
}
