import type { ReactElement } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ProductListProps } from '../../../features/admin/components/AdminDashboard/AdminDashboard.tsx';
import { AdminProductList } from '../../../features/admin/components/AdminProductList/AdminProductList.tsx';
import { getCatalogQueryOptions } from '../../../features/products/modules/catalog/products.query.ts';

interface Props extends ProductListProps {}

/** Reads the shared catalog request inside the admin list's local boundaries.
 * @param props - Current merged products and dashboard-owned editing/deletion actions.
 * @returns Product controls once the API request is ready; pending requests suspend and failures throw.
 */
export function AdminProductPanel(props: Props): ReactElement {
  const query = useSuspenseQuery(getCatalogQueryOptions());
  if (query.error !== null && !query.isFetching) throw query.error;
  return <AdminProductList {...props} />;
}
