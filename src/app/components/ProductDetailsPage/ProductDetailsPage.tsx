import type { ReactElement } from 'react';
import { useCart } from '../../../features/cart/modules/cart/useCart.ts';
import { ProductDetails } from '../../../features/products/components/details/ProductDetails/ProductDetails.tsx';
import { ProductDetailsLoading } from '../../../features/products/components/loading/ProductDetailsLoading/ProductDetailsLoading.tsx';
import { RequestBoundary } from '../../../shared/components/RequestBoundary/RequestBoundary.tsx';

interface Props {
  children?: never;
}

/**
 * Connects the product route to the shared cart at the application boundary.
 * @param props - No configurable inputs.
 * @returns Product details with the provider's cart action.
 */
export function ProductDetailsPage(_props: Props): ReactElement {
  const { addItem } = useCart();
  return (
    <RequestBoundary loading={<ProductDetailsLoading />}>
      <ProductDetails onAddToCart={addItem} />
    </RequestBoundary>
  );
}
