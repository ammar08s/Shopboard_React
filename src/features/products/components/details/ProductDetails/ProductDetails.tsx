import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router';
import type { Product } from '../../../modules/catalog/products.types.ts';
import { parseProductId } from '../../../modules/details/products.details.ts';
import { useProduct } from '../../../modules/details/useProduct.ts';
import { formatPrice } from '../../../modules/pricing/products.price.ts';
import { ProductComments } from '../../comments/ProductComments/ProductComments.tsx';
import './ProductDetails.css';

interface Props {
  onAddToCart: (product: Product) => void;
}

/** Displays the API product selected by the route and its request feedback.
 * @param props - Callback connecting an available product to the application-owned cart.
 * @returns Product details, loading feedback, a retryable error, or a not-found page.
 */
export function ProductDetails({ onAddToCart }: Props): ReactElement {
  const { productId } = useParams();
  const { state, retry } = useProduct(parseProductId(productId));
  const backLink = (
    <Link className="products-detail-back" to="/">
      &larr; Back to the collection
    </Link>
  );

  /** Adds the loaded product while preventing unavailable-item submissions. No inputs.
   * @returns Nothing; forwards only an available, successfully loaded product.
   */
  function addToCart(): void {
    if (state.status === 'success' && state.product.inStock) onAddToCart(state.product);
  }

  if (state.status === 'loading') {
    return (
      <section className="products-detail">
        {backLink}
        <p role="status">Loading product details…</p>
        <div className="products-detail-skeleton" aria-hidden="true">
          <div />
          <div />
        </div>
      </section>
    );
  }

  if (state.status === 'not-found') {
    return (
      <section className="products-detail products-detail-message">
        {backLink}
        <h1>Product not found</h1>
        <p>
          This product is unavailable or the link is invalid. Browse the collection to find another.
        </p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="products-detail products-detail-message">
        {backLink}
        <h1>We couldn’t load this product</h1>
        <p role="alert">{state.message}</p>
        <button className="products-detail-button" type="button" onClick={retry}>
          Try again
        </button>
      </section>
    );
  }

  const { product } = state;
  return (
    <section className="products-detail" aria-labelledby="products-detail-title">
      {backLink}
      <div className="products-detail-layout">
        <div className="products-detail-art" aria-hidden="true">
          <span>{product.category}</span>
          <strong>{product.title.charAt(0)}</strong>
          <small>N° {String(product.id).padStart(2, '0')}</small>
        </div>
        <div className="products-detail-content">
          <p className="products-detail-category">{product.category}</p>
          <h1 id="products-detail-title">{product.title}</h1>
          <p className="products-detail-price">
            {formatPrice(product.priceCents)} <span>USD</span>
          </p>
          <dl className="products-detail-facts">
            <div>
              <dt>Availability</dt>
              <dd>{product.inStock ? 'In stock' : 'Out of stock'}</dd>
            </div>
            <div>
              <dt>Product ID</dt>
              <dd>{product.id}</dd>
            </div>
          </dl>
          <button
            className="products-detail-button"
            type="button"
            onClick={addToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to cart' : 'Unavailable'}
          </button>
        </div>
      </div>
      <ProductComments key={product.id} productId={product.id} />
    </section>
  );
}
