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

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Tests use Node's built-in runner and discover every `src/**/*.test.ts` file.

## Project structure

Every feature separates UI in `components/` from non-UI code in `modules/`. Each component owns its folder and CSS. Each module groups files by a specific responsibility, with tests beside the implementation. Components import modules; modules never import components. Features communicate through the application layer.

```text
src/
  app/
    App.tsx                         # Storefront composition
    App.css                         # Shell and collection heading
    components/
      StoreHeader/                  # Component and header CSS
      StoreIntro/                   # Component and introduction CSS
      StoreFooter/                  # Component and footer CSS
  features/
    products/
      components/
        Products/                   # Request-state composition
        ProductCatalog/             # Browsing composition and layout CSS
        ProductFilters/             # Controlled search and filter sidebar
        ProductToolbar/             # Result count and controlled sort selector
        ProductGrid/                # Keyed cards and responsive grid CSS
        ProductCard/                # Product information and card CSS
        ProductLoading/             # Loading status and responsive skeleton layout
        ProductCardSkeleton/        # Decorative card placeholder and CSS
        ProductFiltersSkeleton/     # Decorative filter placeholders and CSS
        ProductError/               # Error alert and retry action
        ProductEmptyState/          # Empty catalog or no matching results
        productFeedback.css         # Styles shared by error and empty feedback
        productSkeleton.css         # Shared placeholder shapes and shimmer
      modules/
        catalog/
          products.api.ts           # Catalog endpoint using the shared client
          products.data.ts          # Validate and map unknown API data
          products.data.test.ts
          products.types.ts         # Product domain model
          useProducts.ts            # Request lifecycle, cancellation, and retry
        filtering/
          products.filters.ts       # Defaults, categories, selection, sort validation
          products.filters.test.ts
          products.filters.types.ts # Filter model and sort options
          useProductFilters.ts      # Filter state, reset, and derived results
        pricing/
          products.price.ts         # Format integer cents as USD
          products.price.test.ts
  shared/
    api/apiClient.ts                # Base URL, HTTP, JSON parsing, errors
    styles/global.css               # Resets, variables, focus styles, base typography
    styles/typography.css           # Eyebrow style reused by app and feature UI
  main.tsx                          # Global styles and React mounting
```

Import files directly; there are no re-export barrels. Component-specific responsive rules stay in the component's stylesheet. Genuinely shared feedback and skeleton styles live in `productFeedback.css` and `productSkeleton.css`. Application components use shared typography without depending on feature CSS.

## Component tree

The tree lists every application component, its exact source file, props, and conditional mounting. Every component declares a typed `Props` interface. `Props: none` means `{ children?: never }`, with no configurable inputs.

```text
App — src/app/App.tsx
Props: none
├── StoreHeader — src/app/components/StoreHeader/StoreHeader.tsx
│   Props: none
├── StoreIntro — src/app/components/StoreIntro/StoreIntro.tsx
│   Props: none
├── Products — src/features/products/components/Products/Products.tsx
│   Props: none
│   ├── ProductLoading [loading only]
│   │   File: src/features/products/components/ProductLoading/ProductLoading.tsx
│   │   Props: none
│   │   ├── ProductFiltersSkeleton
│   │   │   File: src/features/products/components/ProductFiltersSkeleton/ProductFiltersSkeleton.tsx
│   │   │   Props: none
│   │   └── ProductCardSkeleton [six placeholder slots]
│   │       File: src/features/products/components/ProductCardSkeleton/ProductCardSkeleton.tsx
│   │       Props: none
│   │       React key: stable placeholder slot ID
│   ├── ProductError [error only]
│   │   File: src/features/products/components/ProductError/ProductError.tsx
│   │   Props: { message: string; onRetry: () => void }
│   └── ProductCatalog [success only]
│       File: src/features/products/components/ProductCatalog/ProductCatalog.tsx
│       Props: { products: Product[] }
│       ├── ProductFilters
│       │   File: src/features/products/components/ProductFilters/ProductFilters.tsx
│       │   Props: {
│       │     filters: ProductFilters;
│       │     categories: string[];
│       │     onChange: (filters: ProductFilters) => void;
│       │     onReset: () => void;
│       │   }
│       ├── ProductToolbar
│       │   File: src/features/products/components/ProductToolbar/ProductToolbar.tsx
│       │   Props: {
│       │     matchingCount: number;
│       │     totalCount: number;
│       │     sort: SortOrder;
│       │     onSortChange: (value: string) => void;
│       │   }
│       ├── ProductGrid [one or more matches]
│       │   File: src/features/products/components/ProductGrid/ProductGrid.tsx
│       │   Props: { products: Product[] } (filtered and sorted)
│       │   └── ProductCard [one per matching product]
│       │       File: src/features/products/components/ProductCard/ProductCard.tsx
│       │       Props: { product: Product }
│       │       React key: product.id
│       └── ProductEmptyState [no matches, including an empty API catalog]
│           File: src/features/products/components/ProductEmptyState/ProductEmptyState.tsx
│           Props: { totalCount: number; onReset: () => void }
└── StoreFooter — src/app/components/StoreFooter/StoreFooter.tsx
    Props: none
```

`ProductFilters` in props is the domain interface from `modules/filtering/products.filters.types.ts`; the component imports it as `Filters`. `SortOrder` is `'name' | 'price-asc' | 'price-desc'`. The `Product` interface lives in `modules/catalog/products.types.ts`:

```ts
interface Product {
  id: number;
  title: string;
  category: string;
  priceCents: number;
  inStock: boolean;
}
```

`src/main.tsx` mounts `App` inside React's built-in `StrictMode`. React internals, HTML elements, and fragments are omitted from the tree. Hooks, event handlers, and API helpers are functions, not component nodes.

### Conditional branches

- While loading, `ProductLoading` mounts under `Products`, with `ProductFiltersSkeleton` and six `ProductCardSkeleton` children. Its toolbar is decorative markup, not a separate component. A single status announces loading, and all placeholder shapes are hidden from assistive technology and contain no focusable controls. The skeleton matches the catalog's two-column mobile and three-column wide-screen grid; shimmer is disabled for reduced-motion preferences. No artificial delay is added.
- On error, `ProductError` replaces the skeleton; retry starts a fresh request and shows the skeleton again. Success replaces it with the catalog.
- On success, `ProductCatalog`, `ProductFilters`, and `ProductToolbar` mount even when the API returns no products.
- With matches, `ProductGrid` mounts a `ProductCard` per match. Otherwise, `ProductEmptyState` replaces the grid. An empty API catalog shows different copy and no reset button; filters excluding all products show a clear-filters action.
- Search, category, availability, and sorting change the grid's products. Cards use stable `product.id` keys; category options use unique category strings.

## State ownership

| State               | Owning component and hook                              | Source                                                         | Initial value and purpose                                                                                                                                      |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`             | `Products` through `useProducts()`                     | `src/features/products/modules/catalog/useProducts.ts`         | `{ status: 'loading' }`; becomes `{ status: 'success', products: Product[] }` or `{ status: 'error', message: string }`. Owns catalog data and request status. |
| `attempt`           | `Products` through `useProducts()`                     | `src/features/products/modules/catalog/useProducts.ts`         | `0`; retry increments it to trigger another request.                                                                                                           |
| `filters.query`     | `ProductCatalog` through `useProductFilters(products)` | `src/features/products/modules/filtering/useProductFilters.ts` | `''`; controlled search text.                                                                                                                                  |
| `filters.category`  | `ProductCatalog` through `useProductFilters(products)` | `src/features/products/modules/filtering/useProductFilters.ts` | `''`; all categories until one is selected.                                                                                                                    |
| `filters.stockOnly` | `ProductCatalog` through `useProductFilters(products)` | `src/features/products/modules/filtering/useProductFilters.ts` | `false`; whether to show only available products.                                                                                                              |
| `filters.sort`      | `ProductCatalog` through `useProductFilters(products)` | `src/features/products/modules/filtering/useProductFilters.ts` | `'name'`; also accepts `'price-asc'` and `'price-desc'`.                                                                                                       |

The four filter fields form one `useState<ProductFilters>` object. `resetFilters()` restores defaults from `initialProductFilters` in `products.filters.ts`. Unmounting `ProductCatalog` discards its filters. Extracting the hook does not transfer state ownership to a separate component.

All other components have no local React state. `ProductFilters` and `ProductToolbar` receive controlled values and report changes through callbacks. Their event handlers only adapt browser events; selection rules, sort validation, and state updates live in the filtering module.

`visibleProducts`, distinct alphabetical `categories`, and displayed counts are derived during rendering, not stored as extra state. `AbortController` is request lifecycle bookkeeping; effect cleanup cancels replaced or unmounted requests, and aborted requests cannot publish results or errors.

### Props and data flow

1. `Products` calls `useProducts()`, which fetches through `products.api.ts`, validates with `products.data.ts`, and uses the shared HTTP client.
2. Successful products pass into `ProductCatalog`, which calls `useProductFilters(products)` to own choices and derive categories and visible products.
3. `ProductFilters` receives `filters`, `categories`, `setFilters` as `onChange`, and `resetFilters` as `onReset`.
4. `ProductToolbar` receives current counts and sort; `onSortChange` calls the hook's validated `changeSort` action.
5. `ProductGrid` receives selected products and passes each to `ProductCard`, which uses the pricing module. React's `key` is reconciliation metadata, not a card prop.
6. `ProductEmptyState` receives the full catalog count and reset callback; request failures pass their message and retry action to `ProductError`.

## Verify with React DevTools

1. Run `npm run dev` and open Vite's local URL.
2. Open browser developer tools and choose React DevTools **Components**. Install and enable React DevTools if the tab is missing.
3. Expand `App`, `Products`, `ProductCatalog`, and `ProductGrid`. Compare mounted components with the branches above and inspect their props.
4. Inspect `Products` for `useProducts` request state and retry attempt. Inspect `ProductCatalog` for `useProductFilters` and its four filter fields.
5. Exercise search, category, stock, all sorts, and reset. Confirm grid/card props track matches and no-match searches swap the grid for `ProductEmptyState`.
6. Check loading, retryable errors, an empty catalog, and desktop/mobile widths. API errors unmount the catalog; retry returns to loading before showing results.

Verification status: the structure refactor's component tree, Props interfaces, function comments, and module boundaries were checked against source, and its moved CSS rules were compared with the originals. The skeleton adds two stateless components, for 15 total; all component paths are included above. Eight module tests, lint, build, and formatting pass. A server-render check confirms six card placeholders, the filter skeleton, one status region, hidden decorative markup, no focusable controls, and immediate use by `Products`. Live interaction, visual responsive checks, and React DevTools inspection remain pending: this chat still reports an unavailable browser host and native computer-use connection, including on the supported desktop fallback. Server-render and source checks do not replace browser verification.
