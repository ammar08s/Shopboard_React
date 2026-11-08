import { useRef, useState } from 'react';
import { focusElement } from '../../../../shared/modules/focus/focusElement.ts';
import type { FormEvent, ReactElement } from 'react';
import type { Notify } from '../../../../shared/modules/toasts/toasts.types.ts';
import {
  getCategoryProductCount,
  validateCategoryDeletion,
} from '../../modules/catalog/admin.categories.ts';
import type { AdminProduct } from '../../modules/catalog/admin.products.types.ts';
import './CategoryManager.css';

interface Props {
  products: AdminProduct[];
  categories: string[];
  catalogStatus: 'loading' | 'error' | 'success';
  onDelete: (category: string, replacement: string) => void;
  onNotify: Notify;
}

/** Lists categories and confirms deletion with a replacement that preserves every product.
 * @param props - Current products, category choices, catalog availability, and the local deletion action.
 * @returns Category actions, an empty state, and a conditional replacement/confirmation form.
 */
export function CategoryManager({
  products,
  categories,
  catalogStatus,
  onDelete,
  onNotify,
}: Props): ReactElement {
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const affectedCount =
    pendingCategory === null ? 0 : getCategoryProductCount(products, pendingCategory);

  /** Closes confirmation and returns focus to category management. No inputs.
   * @returns Nothing; clears confirmation state without another mutation or notification.
   */
  function closeConfirmation(): void {
    setPendingCategory(null);
    setError(null);
    headingRef.current?.focus();
  }

  /** Cancels deletion and explains that the category was preserved. No inputs.
   * @returns Nothing; publishes feedback and closes the confirmation form.
   */
  function cancelDeletion(): void {
    if (pendingCategory !== null)
      onNotify({
        variant: 'info',
        message: `${pendingCategory} was kept. No category changes were made.`,
      });
    closeConfirmation();
  }

  /** Validates the destination before deleting the selected category locally.
   * @param event - Category deletion form submission.
   * @returns Nothing; prevents navigation, reports errors, or invokes the local mutation.
   */
  function confirmDeletion(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (pendingCategory === null || catalogStatus !== 'success') return;
    const values = new FormData(event.currentTarget);
    const result = validateCategoryDeletion(
      pendingCategory,
      String(values.get('replacement') ?? ''),
      categories,
    );
    if (!result.success) {
      setError(result.message);
      onNotify({ variant: 'error', message: result.message });
      return;
    }
    onDelete(result.category, result.replacement);
    closeConfirmation();
  }

  /** Renders a category with a deliberate deletion action.
   * @param category - Category name.
   * @returns A keyed category list item.
   */
  function renderCategory(category: string): ReactElement {
    /** Opens the replacement and confirmation form for this category. No inputs.
     * @returns Nothing; selects the category and clears stale validation feedback.
     */
    function requestDeletion(): void {
      setPendingCategory(category);
      setError(null);
    }
    return (
      <li key={category}>
        <span>{category}</span>
        <button
          type="button"
          onClick={requestDeletion}
          disabled={catalogStatus !== 'success'}
          aria-label={`Delete category ${category}`}
        >
          Delete
        </button>
      </li>
    );
  }

  /** Suggests an existing replacement other than the selected category.
   * @param category - Existing category name.
   * @returns A keyed suggestion, or null for the category being deleted.
   */
  function renderReplacement(category: string): ReactElement | null {
    if (category === pendingCategory) return null;
    return <option key={category} value={category} />;
  }

  return (
    <section className="admin-categories" aria-labelledby="admin-categories-title">
      <h2 id="admin-categories-title" ref={headingRef} tabIndex={-1}>
        Manage categories
      </h2>
      <p>Remove a category added by mistake and move its products to another category.</p>
      {catalogStatus !== 'success' ? (
        <p>
          Load the full collection before deleting a category so all of its products can be moved.
        </p>
      ) : null}
      {categories.length === 0 ? (
        <p>No categories to manage yet.</p>
      ) : (
        <ul>{categories.map(renderCategory)}</ul>
      )}
      {pendingCategory !== null ? (
        <form
          key={pendingCategory}
          ref={focusElement}
          tabIndex={-1}
          onSubmit={confirmDeletion}
          className="admin-categories-confirm"
          aria-labelledby="admin-category-delete-title"
          aria-describedby={error === null ? undefined : 'admin-category-error'}
        >
          <h3 id="admin-category-delete-title">Delete category &ldquo;{pendingCategory}&rdquo;?</h3>
          <p>
            Products to move: <strong>{affectedCount}</strong>. All product details will be kept.
          </p>
          <label htmlFor="category-replacement">Move products to</label>
          <input
            id="category-replacement"
            name="replacement"
            list="category-replacements"
            defaultValue={pendingCategory.toLowerCase() === 'uncategorized' ? '' : 'Uncategorized'}
            maxLength={60}
            required
            aria-describedby="category-replacement-hint"
          />
          <datalist id="category-replacements">{categories.map(renderReplacement)}</datalist>
          <span id="category-replacement-hint">
            Choose an existing category or type a replacement name. Uncategorized is available as a
            fallback.
          </span>
          {error !== null ? (
            <p id="admin-category-error" className="admin-categories-error">
              {error}
            </p>
          ) : null}
          <div className="admin-categories-actions">
            <button type="submit" disabled={catalogStatus !== 'success'}>
              Delete category and move products
            </button>
            <button type="button" onClick={cancelDeletion}>
              Keep category
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
