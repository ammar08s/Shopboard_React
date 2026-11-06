import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { resolveCategoryName } from '../../modules/catalog/admin.categories.ts';
import { validateProductDraft } from '../../modules/catalog/admin.products.ts';
import type {
  AdminProduct,
  AdminProductDraft,
} from '../../modules/catalog/admin.products.types.ts';
import './ProductEditor.css';

interface Props {
  product: AdminProduct | null;
  categories: string[];
  onSave: (draft: AdminProductDraft) => void;
  onCancel: () => void;
}

/** Displays a product creation or editing form; the parent keys it when the draft changes.
 * @param props - Product defaults, category choices, and save/cancel actions.
 * @returns A validated product form with existing or newly entered category selection.
 */
export function ProductEditor({ product, categories, onSave, onCancel }: Props): ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(product?.category ?? '');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const selectedCategory = resolveCategoryName(category, categories);

  /** Selects an existing category.
   * @param event - Category dropdown change.
   * @returns Nothing; updates the selected category.
   */
  function selectCategory(event: ChangeEvent<HTMLSelectElement>): void {
    setCategory(event.currentTarget.value);
  }

  /** Opens the new category field. No inputs.
   * @returns Nothing; switches the category input mode and clears stale validation feedback.
   */
  function startNewCategory(): void {
    setCreatingCategory(true);
    setError(null);
  }

  /** Returns to the previous existing category choice. No inputs.
   * @returns Nothing; discards the new category field and clears stale validation feedback.
   */
  function cancelNewCategory(): void {
    setCreatingCategory(false);
    setError(null);
  }

  /** Renders one existing category option.
   * @param name - Unique category name.
   * @returns A keyed select option.
   */
  function renderCategory(name: string): ReactElement {
    return (
      <option key={name} value={name}>
        {name}
      </option>
    );
  }

  /** Validates the submitted fields before publishing a product draft.
   * @param event - Product form submission.
   * @returns Nothing; prevents navigation, reports validation, or calls onSave.
   */
  function submitProduct(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const result = validateProductDraft({
      title: String(values.get('title') ?? ''),
      category: creatingCategory
        ? resolveCategoryName(String(values.get('newCategory') ?? ''), categories)
        : selectedCategory,
      price: String(values.get('price') ?? ''),
      inStock: values.get('inStock') === 'on',
    });
    if (!result.success) {
      setError(result.message);
      return;
    }
    onSave(result.product);
  }

  return (
    <section className="admin-editor" aria-labelledby="admin-editor-title">
      <span className="ui-eyebrow">Collection details</span>
      <h2 id="admin-editor-title">{product === null ? 'Create a product' : 'Edit product'}</h2>
      <form onSubmit={submitProduct}>
        <label htmlFor="product-title">Product name</label>
        <input
          id="product-title"
          name="title"
          defaultValue={product?.title ?? ''}
          maxLength={120}
          required
          autoFocus={product !== null}
        />
        <div className="admin-editor-category-choice">
          <label htmlFor="product-category">Category</label>
          {!creatingCategory ? (
            <button type="button" onClick={startNewCategory}>
              Create new category
            </button>
          ) : null}
        </div>
        <select
          id="product-category"
          name="category"
          value={selectedCategory}
          onChange={selectCategory}
          disabled={creatingCategory}
          required={!creatingCategory}
          aria-describedby="admin-category-hint"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map(renderCategory)}
        </select>
        {creatingCategory ? (
          <>
            <div className="admin-editor-category-choice">
              <label htmlFor="product-new-category">New category name</label>
              <button type="button" onClick={cancelNewCategory}>
                Use existing category
              </button>
            </div>
            <input
              id="product-new-category"
              name="newCategory"
              maxLength={60}
              required
              autoFocus
              aria-describedby="admin-category-hint"
            />
          </>
        ) : null}
        <span id="admin-category-hint" className="admin-editor-hint">
          {creatingCategory
            ? 'The category is saved with this product. Matching existing names are reused.'
            : 'Choose a category or create a new one for this product.'}
        </span>
        <label htmlFor="product-price">Price (USD)</label>
        <input
          id="product-price"
          name="price"
          type="number"
          inputMode="decimal"
          min="0"
          max="1000000"
          step="0.01"
          defaultValue={product === null ? '' : (product.priceCents / 100).toFixed(2)}
          required
          aria-describedby="admin-price-hint"
        />
        <span id="admin-price-hint" className="admin-editor-hint">
          Up to two decimal places. A price of 0 is allowed.
        </span>
        <label className="admin-editor-stock">
          <input name="inStock" type="checkbox" defaultChecked={product?.inStock ?? true} />
          Available in stock
        </label>
        {error !== null ? (
          <p className="admin-editor-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-editor-actions">
          <button type="submit">{product === null ? 'Create product' : 'Save changes'}</button>
          {product !== null ? (
            <button type="button" onClick={onCancel}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
