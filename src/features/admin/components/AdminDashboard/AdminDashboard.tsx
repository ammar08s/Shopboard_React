import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { getAdminCategories } from '../../modules/catalog/admin.categories.ts';
import type {
  AdminProduct,
  AdminProductDraft,
} from '../../modules/catalog/admin.products.types.ts';
import { AdminProductList } from '../AdminProductList/AdminProductList.tsx';
import { ProductEditor } from '../ProductEditor/ProductEditor.tsx';
import './AdminDashboard.css';

interface Props {
  products: AdminProduct[];
  catalogStatus: 'loading' | 'error' | 'success';
  catalogError: string | null;
  storageError: string | null;
  onRetry: () => void;
  onCreate: (draft: AdminProductDraft) => void;
  onUpdate: (id: number, draft: AdminProductDraft) => void;
  onDelete: (id: number) => void;
}

/** Composes local product administration and reports demo-only changes.
 * @param props - Collection, request/storage feedback, and local mutation actions.
 * @returns Product form, collection list, success feedback, and deletion confirmation.
 */
export function AdminDashboard({
  products,
  catalogStatus,
  catalogError,
  storageError,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
}: Props): ReactElement {
  const categories = getAdminCategories(products);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const [message, setMessage] = useState('');
  const confirmationRef = useRef<HTMLDivElement>(null);

  /** Brings the confirmation into view for keyboard and pointer users. No inputs.
   * @returns Nothing; focuses the visible confirmation after a delete request.
   */
  function focusConfirmation(): void {
    if (pendingDelete !== null) confirmationRef.current?.focus();
  }
  useEffect(focusConfirmation, [pendingDelete]);

  /** Restores an empty create form. No inputs.
   * @returns Nothing; clears editing state and remounts the uncontrolled form.
   */
  function resetEditor(): void {
    setEditing(null);
    setFormRevision(formRevision + 1);
  }

  /** Applies the validated draft to the local collection.
   * @param draft - Validated product fields.
   * @returns Nothing; invokes a local mutation, resets the form, and announces success.
   */
  function saveProduct(draft: AdminProductDraft): void {
    if (editing === null) {
      onCreate(draft);
      setMessage(`${draft.title} created in your demo collection.`);
    } else {
      onUpdate(editing.id, draft);
      setMessage(`${draft.title} updated in your demo collection.`);
    }
    resetEditor();
  }

  /** Opens a product's current values in the editor.
   * @param product - Product to edit.
   * @returns Nothing; remounts the editor and clears pending feedback.
   */
  function editProduct(product: AdminProduct): void {
    setEditing(product);
    setFormRevision(formRevision + 1);
    setPendingDelete(null);
    setMessage('');
  }

  /** Requests a deliberate confirmation before deletion.
   * @param product - Product to delete.
   * @returns Nothing; displays the confirmation controls.
   */
  function requestDelete(product: AdminProduct): void {
    setPendingDelete(product);
    setMessage('');
  }

  /** Cancels deletion. No inputs.
   * @returns Nothing; removes the confirmation prompt.
   */
  function cancelDelete(): void {
    setPendingDelete(null);
  }

  /** Deletes the confirmed product from this browser's demo collection. No inputs.
   * @returns Nothing; invokes deletion, resets a matching editor, and announces success.
   */
  function confirmDelete(): void {
    if (pendingDelete === null) return;
    onDelete(pendingDelete.id);
    if (editing?.id === pendingDelete.id) resetEditor();
    setMessage(`${pendingDelete.title} deleted from your demo collection.`);
    setPendingDelete(null);
  }

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard-heading">
        <div>
          <span className="ui-eyebrow">Your store, at a glance</span>
          <h1 id="admin-dashboard-title">
            Manage the collection<span>.</span>
          </h1>
        </div>
        <a href="#collection">View storefront &rarr;</a>
      </div>
      <p className="admin-dashboard-note">
        <strong>Demo workspace.</strong> Changes appear in your storefront and are saved only in
        this browser. The original API is read-only.
      </p>
      {storageError !== null ? (
        <p className="admin-dashboard-warning" role="alert">
          {storageError}
        </p>
      ) : null}
      {catalogStatus === 'loading' ? (
        <p role="status">Loading the API collection. You can still create demo products.</p>
      ) : null}
      {catalogStatus === 'error' ? (
        <div className="admin-dashboard-warning" role="alert">
          <p>{catalogError} Your saved demo products remain editable.</p>
          <button type="button" onClick={onRetry}>
            Retry collection
          </button>
        </div>
      ) : null}
      <p className="admin-dashboard-status" role="status">
        {message}
      </p>
      {pendingDelete !== null ? (
        <div
          ref={confirmationRef}
          tabIndex={-1}
          className="admin-dashboard-confirm"
          role="group"
          aria-label="Confirm product deletion"
        >
          <p>
            Delete <strong>{pendingDelete.title}</strong> from this demo collection?
          </p>
          <div>
            <button type="button" onClick={confirmDelete}>
              Confirm delete
            </button>
            <button type="button" onClick={cancelDelete}>
              Keep product
            </button>
          </div>
        </div>
      ) : null}
      <div className="admin-dashboard-layout">
        <ProductEditor
          key={formRevision}
          product={editing}
          categories={categories}
          onSave={saveProduct}
          onCancel={resetEditor}
        />
        <AdminProductList
          products={products}
          onEdit={editProduct}
          onRequestDelete={requestDelete}
        />
      </div>
    </section>
  );
}
