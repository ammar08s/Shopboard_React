import type { ReactElement } from 'react';
import { useCart } from '../../../features/cart/modules/cart/useCart.ts';
import { Products } from '../../../features/products/components/Products/Products.tsx';
import type { Product } from '../../../features/products/modules/catalog/products.types.ts';
import { StoreIntro } from '../StoreIntro/StoreIntro.tsx';
import './CollectionPage.css';

interface Props {
  products: Product[];
  onRetry: () => void;
}

/** Composes the introduction, heading, and catalog for the collection route.
 * @param props - Application-derived merged products and retry action.
 * @returns The collection page with its existing API feedback and product controls.
 */
export function CollectionPage({ products, onRetry }: Props): ReactElement {
  const { addItem } = useCart();
  return (
    <>
      <StoreIntro />
      <div id="collection" className="store-collection-heading">
        <h2>
          The collection<span>.</span>
        </h2>
        <span>YOUR NEXT GOOD FIND STARTS HERE</span>
      </div>
      <Products products={products} onRetry={onRetry} onAddToCart={addItem} />
    </>
  );
}
