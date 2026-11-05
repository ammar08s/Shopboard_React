# ShopBoard

A React and TypeScript storefront built with Vite and plain CSS for the Corehub Istanbul software engineering course. Browse products from the ShopBoard API, search by name, filter by category or availability, and sort by name or price.

Product requirements live in [design.md](design.md). Engineering conventions live in [AGENTS.md](AGENTS.md).

## Run locally

```sh
npm install
npm run dev
```

The API defaults to `https://shopboard-api.vercel.app`. To override it, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL`.

```sh
npm test
npm run lint
npm run build
```

## Component tree

Every application component is listed below with its exact source file and props. The tree shows a successfully loaded catalog with at least one matching product. Each component has its own file and a typed `Props` interface.

```text
App — src/App.tsx
Props: { children?: never } (no configurable props)
├── StoreHeader — src/app/StoreHeader.tsx
│   Props: { children?: never } (no configurable props)
└── Products — src/features/products/Products.tsx
    Props: { children?: never } (no configurable props)
    └── ProductCatalog — src/features/products/ProductCatalog.tsx
        Props: { products: Product[] }
        ├── ProductFilters — src/features/products/ProductFilters.tsx
        │   Props: {
        │     filters: ProductFilters;
        │     categories: string[];
        │     onChange: (filters: ProductFilters) => void;
        │     onReset: () => void;
        │   }
        └── ProductGrid — src/features/products/ProductGrid.tsx
            Props: { products: Product[] } (filtered and sorted)
            └── ProductCard [one per matching product]
                File: src/features/products/ProductCard.tsx
                Props: { product: Product }
                React key: product.id
```

`ProductFilters` in the props above is the data interface from `products.types.ts`; its component files import it under the alias `Filters`. It is distinct from the component named `ProductFilters`.

`src/main.tsx` mounts `App` inside React's built-in `StrictMode`. `StrictMode` is not a project component and has no separate component file. HTML elements and fragments are omitted from this component tree. Hooks, event handlers, and API helpers are functions, not component nodes.

### Conditional branches

- While loading or after a request error, `Products` renders its feedback directly; `ProductCatalog` and its descendants are not mounted. The error branch offers a retry button.
- After a successful request, `ProductCatalog` and `ProductFilters` are mounted even if the API returns no products.
- When there are no matching products, `ProductCatalog` renders empty-result feedback instead of `ProductGrid`; no `ProductCard` components are mounted.
- Search, filters, and sorting change the cards rendered inside `ProductGrid`. Each card uses `product.id` as its key. Category choices use their unique category strings as keys. Neither list uses indexes.

## State ownership

| State               | Owning component                    | Definition                                 | Initial value and purpose                                                                                                                                             |
| ------------------- | ----------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`             | `Products`, through `useProducts()` | `src/features/products/products.state.ts`  | `{ status: 'loading' }`; becomes `{ status: 'success', products: Product[] }` or `{ status: 'error', message: string }`. Owns the fetched catalog and request status. |
| `attempt`           | `Products`, through `useProducts()` | `src/features/products/products.state.ts`  | `0`; incremented by `retry()` to trigger a fresh request.                                                                                                             |
| `filters.query`     | `ProductCatalog`                    | `src/features/products/ProductCatalog.tsx` | `''`; controlled search text.                                                                                                                                         |
| `filters.category`  | `ProductCatalog`                    | `src/features/products/ProductCatalog.tsx` | `''`; all categories until a category is selected.                                                                                                                    |
| `filters.stockOnly` | `ProductCatalog`                    | `src/features/products/ProductCatalog.tsx` | `false`; whether to include only products in stock.                                                                                                                   |
| `filters.sort`      | `ProductCatalog`                    | `src/features/products/ProductCatalog.tsx` | `'name'`; also accepts `'price-asc'` and `'price-desc'`.                                                                                                              |

The four filter fields belong to one `useState<ProductFilters>` object. `reset()` restores all four defaults. Unmounting `ProductCatalog` also discards its filter state.

`App`, `StoreHeader`, `ProductFilters`, `ProductGrid`, and `ProductCard` have no local React state. `ProductFilters` receives controlled values and requests changes through its callbacks. Sort changes are handled directly by `ProductCatalog`.

`visibleProducts`, unique sorted `categories`, and displayed result counts are derived during rendering. They are not stored as additional state. The `AbortController` in `useProducts` is request lifecycle bookkeeping, not React state; cleanup cancels the request when the effect is replaced or its component unmounts.

### Props and data flow

1. `Products` calls `useProducts()`, which loads and validates API data through `products.api.ts`, `products.data.ts`, and the shared API client.
2. On success, `Products` passes `state.products` to `ProductCatalog` as `products`.
3. `ProductCatalog` passes `filters`, derived `categories`, `setFilters` as `onChange`, and `reset` as `onReset` to `ProductFilters`.
4. `ProductCatalog` derives `visibleProducts` with `selectProducts(products, filters)` and passes them as `products` to `ProductGrid`.
5. `ProductGrid` passes each item as `product` to its `ProductCard`. React's `key` is reconciliation metadata, not a prop received by the card.

The shared domain types are defined in `src/features/products/products.types.ts`:

```ts
interface Product {
  id: number;
  title: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}

interface ProductFilters {
  query: string;
  category: string;
  stockOnly: boolean;
  sort: 'name' | 'price-asc' | 'price-desc';
}
```

## Verify with React DevTools

1. Run `npm run dev` and open the local URL printed by Vite.
2. Open browser developer tools and choose the React DevTools **Components** tab. If that tab is missing, React DevTools must be installed and enabled in that browser.
3. Wait for the API products to load. Expand `App`, `Products`, `ProductCatalog`, and `ProductGrid`. Compare the custom components with the README tree above; DevTools may additionally show `StrictMode` depending on its filters.
4. Select each component to inspect its props. `ProductCatalog.products` should contain the loaded catalog; `ProductGrid.products` should contain only the current matches; each `ProductCard.product` should be the corresponding record.
5. Inspect the hooks on `Products`: the `useProducts` hook owns request `state` and retry `attempt`. Inspect the hooks on `ProductCatalog`: its state contains the four filter fields listed above.
6. Change the search, category, availability, and sort controls. Confirm the filter state changes on `ProductCatalog`, callback props remain on `ProductFilters`, and grid/card props reflect the matches. Reset restores the defaults. A search with no matches removes `ProductGrid` and its cards from the mounted tree.

Verification status: the component names, nesting, files, props, and state ownership have been checked against the source. The React DevTools inspection is still pending. The latest attempt found no connected browser in the browser tool (`The browser access host is unavailable`). The Windows fallback could read Chrome's accessibility text, but screenshot capture timed out and keyboard navigation did not switch to the store tab. Do not treat source inspection as a completed DevTools check.
