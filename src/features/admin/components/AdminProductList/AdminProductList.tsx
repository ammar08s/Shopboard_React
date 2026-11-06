import type { ReactElement } from 'react';
import type { AdminProduct } from '../../modules/catalog/admin.products.types.ts';
import './AdminProductList.css';

interface Props {
  products: AdminProduct[];
  onEdit: (product: AdminProduct) => void;
  onRequestDelete: (product: AdminProduct) => void;
}

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Lists the editable collection with explicit product actions.
 * @param props - Current products and edit/delete-request callbacks.
 * @returns Product summaries, or an empty collection message.
 */
export function AdminProductList({ products, onEdit, onRequestDelete }: Props): ReactElement {
  /** Renders one product summary and binds its actions.
   * @param product - Product to display.
   * @returns A keyed list item with accessible action names.
   */
  function renderProduct(product: AdminProduct): ReactElement {
    /** Opens this product for editing. No inputs.
     * @returns Nothing; calls the editor callback.
     */
    function editProduct(): void {
      onEdit(product);
    }
    /** Requests confirmation before removing this product. No inputs.
     * @returns Nothing; calls the delete-request callback.
     */
    function requestDelete(): void {
      onRequestDelete(product);
    }
    return (
      <li key={product.id} className="admin-product">
        <div className="admin-product-details">
          <span className="admin-product-category">{product.category}</span>
          <h3>{product.title}</h3>
          <p>
            {priceFormatter.format(product.priceCents / 100)} USD{' '}
            <span>&middot; {product.inStock ? 'In stock' : 'Out of stock'}</span>
          </p>
        </div>
        <div className="admin-product-actions">
          <button type="button" onClick={editProduct} aria-label={`Edit ${product.title}`}>
            Edit
          </button>
          <button type="button" onClick={requestDelete} aria-label={`Delete ${product.title}`}>
            Delete
          </button>
        </div>
      </li>
    );
  }

  return (
    <section className="admin-product-list" aria-labelledby="admin-products-title">
      <div className="admin-product-list-heading">
        <h2 id="admin-products-title">Your collection</h2>
        <span>{products.length} products</span>
      </div>
      {products.length > 0 ? (
        <ul>{products.map(renderProduct)}</ul>
      ) : (
        <p className="admin-product-list-empty">
          No products here yet. Create one to start your demo collection.
        </p>
      )}
    </section>
  );
}
