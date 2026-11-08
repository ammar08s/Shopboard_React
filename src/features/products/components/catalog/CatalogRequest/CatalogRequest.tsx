import type { ReactElement, ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogQueryOptions } from '../../../modules/catalog/products.query.ts';

interface Props {
  children: ReactNode;
}

/** Gates composed catalog UI on the shared request without owning another data copy.
 * @param props - Storefront or application-composed admin content that needs the catalog.
 * @returns Children when ready; pending requests suspend and failures reach the local boundary.
 */
export function CatalogRequest({ children }: Props): ReactElement {
  const query = useSuspenseQuery(catalogQueryOptions);
  if (query.error !== null && !query.isFetching) throw query.error;
  return <>{children}</>;
}
