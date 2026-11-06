# ShopBoard

A React and TypeScript storefront built with Vite and plain CSS for the Corehub Istanbul software engineering course. Browse and filter the API collection, save products to a cart, and try product management in a local admin demo.

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

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Tests use Node's built-in runner and discover every `src/**/*.test.ts` file. No new runtime dependencies are needed for login, admin, or cart.

## Try the demo

Use **Admin login** in the header, or open `#login` / `#admin`.

| Field    | Demo value             |
| -------- | ---------------------- |
| Email    | `admin@shopboard.demo` |
| Password | `Admin123!`            |

The login page displays these credentials. Incorrect credentials show an error. A successful login opens the dashboard; **Sign out** returns to login. The simulated session lasts for the current tab and survives refresh when sessionStorage is available. These public credentials and the client-side gate provide no real authentication or backend authorization.

Create a product, edit its name/category/USD price/stock, or delete it after confirmation. Changes appear in the storefront and survive refresh in this browser. API products are never changed remotely: the shared client only reads the collection, and a local changes layer merges edits, additions, and deletions. Created products use negative IDs, which are retained after deletion to avoid reuse. Prices allow zero through 1,000,000 USD with at most two decimal places.

Choose an existing category from the product form's dropdown, or click **Create new category** to enter a name. **Use existing category** cancels the new name and restores the previous selection. Saving the product saves its category and makes it available for future products and storefront filtering. Names are trimmed, limited to 60 characters, and reuse matching existing categories regardless of capitalization. Categories are derived from products; empty categories are not saved independently.

Use **Add to cart** on available products, then **Cart** in the header. Repeated additions increase quantity; use the cart's plus/minus buttons, remove an item, or clear the cart. Quantities range from 1 to 99. The header count includes all units. Line totals and the subtotal use integer cents and display USD. Checkout, orders, and payments are outside this demo.

| Storage        | Key                          | Behavior                                                       |
| -------------- | ---------------------------- | -------------------------------------------------------------- |
| localStorage   | `shopboard.catalog.v1`       | Versioned local product replacements/additions and deleted IDs |
| localStorage   | `shopboard.cart.v1`          | Versioned product snapshots and quantities                     |
| sessionStorage | `shopboard.admin.session.v1` | Simulated sign-in for this tab                                 |

Saved data is validated before use. Malformed data falls back safely; denied writes show persistence feedback and keep the current visit usable. Product edits/deletions do not alter existing cart snapshots. Adding the same available product again refreshes its snapshot and price. Data is local to this browser and origin; no cross-tab synchronization or cross-device persistence is provided.

## Project structure

Each feature separates UI in `components/` from non-UI responsibilities in `modules/`. Components own their folders and CSS. Larger collections group related component folders by responsibility. Tests live beside their modules. Components may import modules; modules never import components. Features communicate through the application layer and explicit callbacks.

```text
src/
  app/
    App.tsx                         # Composition and cross-feature coordination
    App.css                         # Shell and collection heading
    components/
      StoreHeader/                  # Navigation, cart count, session controls
      StoreIntro/                   # Collection introduction
      StoreFooter/                  # Store footer
    modules/navigation/storePage.ts # URL fragment snapshots and subscriptions
  features/
    admin/
      components/
        Login/                      # Credentials, form, errors
        AdminDashboard/             # CRUD composition, status, delete confirmation
        ProductEditor/              # Validated create/edit form
        AdminProductList/           # Product summaries and actions
      modules/
        session/                    # Demo credential/session helpers and hook
        catalog/                    # Form/category validation, choices, and admin's prop model
    cart/
      components/
        Cart/                       # Empty/populated cart and subtotal
        CartLine/                   # Quantity and removal controls
      modules/cart/                 # Cart rules, types, storage, price, state hook
    products/
      components/
        Products/                   # Request feedback and catalog composition
        catalog/                    # ProductCatalog, ProductGrid, ProductCard
        filtering/                  # ProductFilters, ProductToolbar
        loading/                    # ProductLoading and skeletons
        feedback/                   # ProductError and ProductEmptyState
      modules/
        catalog/                    # API, response validation, model, request hook
        demo/                       # Local changes, validation, storage, state hook
        filtering/                  # Filter/sort rules, types, and state hook
        pricing/                    # USD formatting
  shared/
    api/apiClient.ts                # Base URL, HTTP, JSON parsing, errors
    styles/global.css               # Resets, variables, focus styles, typography
    styles/typography.css           # Shared eyebrow style
  main.tsx                          # Global styles and React mounting
```

Import files directly; there are no re-export barrels. Product-specific shared feedback and skeleton CSS live in `components/feedback/productFeedback.css` and `components/loading/productSkeleton.css`. Every other component stylesheet is colocated. No feature imports another feature. Admin and cart own structural product contracts; `App` passes compatible catalog values and callbacks between features.

## Component tree

This tree includes every component file, its configurable props, and conditional mounting. Each file declares a typed `Props` interface. `none` means `{ children?: never }`. Types and callback signatures follow the tree.

```text
App — src/app/App.tsx
Props: none
├── StoreHeader — src/app/components/StoreHeader/StoreHeader.tsx
│   Props: { page: StorePage; cartCount: number; signedIn: boolean; onLogout: () => void }
├── StoreIntro [collection page]
│   File: src/app/components/StoreIntro/StoreIntro.tsx
│   Props: none
├── Products [collection page]
│   File: src/features/products/components/Products/Products.tsx
│   Props: { state: CatalogState; products: Product[]; onRetry: () => void;
│            onAddToCart: (product: Product) => void }
│   ├── ProductLoading [loading only]
│   │   File: src/features/products/components/loading/ProductLoading/ProductLoading.tsx
│   │   Props: none
│   │   ├── ProductFiltersSkeleton
│   │   │   File: src/features/products/components/loading/ProductFiltersSkeleton/ProductFiltersSkeleton.tsx
│   │   │   Props: none
│   │   └── ProductCardSkeleton [six stable placeholder slots]
│   │       File: src/features/products/components/loading/ProductCardSkeleton/ProductCardSkeleton.tsx
│   │       Props: none
│   ├── ProductError [error only]
│   │   File: src/features/products/components/feedback/ProductError/ProductError.tsx
│   │   Props: { message: string; onRetry: () => void }
│   └── ProductCatalog [success, or error with saved local products]
│       File: src/features/products/components/catalog/ProductCatalog/ProductCatalog.tsx
│       Props: { products: Product[]; onAddToCart: (product: Product) => void }
│       ├── ProductFilters
│       │   File: src/features/products/components/filtering/ProductFilters/ProductFilters.tsx
│       │   Props: { filters: ProductFilters; categories: string[];
│       │            onChange: (filters: ProductFilters) => void; onReset: () => void }
│       ├── ProductToolbar
│       │   File: src/features/products/components/filtering/ProductToolbar/ProductToolbar.tsx
│       │   Props: { matchingCount: number; totalCount: number; sort: SortOrder;
│       │            onSortChange: (value: string) => void }
│       ├── ProductGrid [one or more matches]
│       │   File: src/features/products/components/catalog/ProductGrid/ProductGrid.tsx
│       │   Props: { products: Product[]; onAddToCart: (product: Product) => void }
│       │   └── ProductCard [one per matching product; key: product.id]
│       │       File: src/features/products/components/catalog/ProductCard/ProductCard.tsx
│       │       Props: { product: Product; onAddToCart: (product: Product) => void }
│       └── ProductEmptyState [no matches, including an empty catalog]
│           File: src/features/products/components/feedback/ProductEmptyState/ProductEmptyState.tsx
│           Props: { totalCount: number; onReset: () => void }
├── Cart [cart page]
│   File: src/features/cart/components/Cart/Cart.tsx
│   Props: { items: CartItem[]; totalCents: number; storageError: string | null;
│            onQuantityChange: (productId: number, quantity: number) => void;
│            onRemove: (productId: number) => void; onClear: () => void }
│   └── CartLine [one per saved product; key: item.id; absent when empty]
│       File: src/features/cart/components/CartLine/CartLine.tsx
│       Props: { item: CartItem; onQuantityChange: (productId: number, quantity: number) => void;
│                onRemove: (productId: number) => void }
├── Login [admin page while signed out]
│   File: src/features/admin/components/Login/Login.tsx
│   Props: { onLogin: (email: string, password: string) => boolean }
├── AdminDashboard [admin page while signed in]
│   File: src/features/admin/components/AdminDashboard/AdminDashboard.tsx
│   Props: { products: AdminProduct[]; catalogStatus: 'loading' | 'error' | 'success';
│            catalogError: string | null; storageError: string | null; onRetry: () => void;
│            onCreate: (draft: AdminProductDraft) => void;
│            onUpdate: (id: number, draft: AdminProductDraft) => void;
│            onDelete: (id: number) => void }
│   ├── ProductEditor [key: formRevision; remounts when saving, editing, or cancelling]
│   │   File: src/features/admin/components/ProductEditor/ProductEditor.tsx
│   │   Props: { product: AdminProduct | null; categories: string[];
│   │            onSave: (draft: AdminProductDraft) => void;
│   │            onCancel: () => void }
│   └── AdminProductList
│       File: src/features/admin/components/AdminProductList/AdminProductList.tsx
│       Props: { products: AdminProduct[]; onEdit: (product: AdminProduct) => void;
│                onRequestDelete: (product: AdminProduct) => void }
└── StoreFooter — src/app/components/StoreFooter/StoreFooter.tsx
    Props: none
```

`src/main.tsx` mounts `App` in React's `StrictMode`. HTML elements, fragments, hooks, and React internals are omitted. There are 21 application components.

`StorePage` is `'collection' | 'cart' | 'admin'`. The `#collection`, `#cart`, and `#admin` / `#login` fragments select pages; the demo session decides whether the admin page displays login or dashboard. Browser history works without a router dependency. The skip link focuses the current main content without changing pages.

`Product` is `{ id: number; title: string; category: string; priceCents: number; inStock: boolean }`. Admin's independent `AdminProduct` and cart's independent `CartProduct` have the same shape. `AdminProductDraft` omits `id`; `CartItem` extends `CartProduct` with `quantity: number`. `CatalogState` is `{ status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; products: Product[] }`.

`ProductFilters` is `{ query: string; category: string; stockOnly: boolean; sort: SortOrder }`; the component imports it as `Filters`. `SortOrder` is `'name' | 'price-asc' | 'price-desc'`.

## State ownership and data flow

| Owner                                           | State / source                                        | Behavior                                                                                                                  |
| ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `App`, `useSyncExternalStore`                   | URL page snapshot                                     | Subscribes to hash navigation; title and main-content focus synchronize with page/session changes                         |
| `App`, `useProducts()`                          | API `state` and retry `attempt`                       | Starts loading; validates successful responses; reports errors; retry increments attempt; aborts stale/unmounted requests |
| `App`, `useDemoCatalog(baseProducts)`           | Local `catalog` changes and storage error             | Restores saved edits once; actions persist immediately; derives merged products without duplicating API state             |
| `App`, `useDemoAuth()`                          | `signedIn`                                            | Restores tab-scoped demo session; login checks credentials; logout clears the session                                     |
| `App`, `useCart()`                              | Cart items and persistence feedback                   | Restores snapshots once; actions persist immediately; derives count and total                                             |
| `ProductCatalog`, `useProductFilters(products)` | One filters object                                    | Defaults to empty query/category, stock-only false, name sort; reset restores defaults                                    |
| `ProductCard`                                   | `hasAdded`                                            | Shows an acknowledgement and cart link after addition; discarded when card unmounts                                       |
| `Login`                                         | `error`                                               | Announces incorrect credentials; form inputs are native uncontrolled fields                                               |
| `AdminDashboard`                                | `editing`, `pendingDelete`, `formRevision`, `message` | Selects editor defaults, confirms deletion, remounts form after actions, announces success                                |
| `ProductEditor`                                 | `error`, selected `category`, `creatingCategory`      | Owns category selection/creation mode; other fields are native uncontrolled inputs; validates all submitted values        |

The cart and catalog hooks use refs only to retain the latest mutation snapshot for successive event-handler calls. They do not read those refs during rendering. Filtered products, categories, counts, prices, and merged catalog values are derived during rendering. All other components are stateless and report actions through props.

`App` keeps one API request lifecycle alive across page navigation. The products feature renders a skeleton while loading, a retryable alert on failure, and the catalog on success. If the API fails but local products exist, they remain browsable under the error alert. Empty API results and filters with no matches have different feedback. The skeleton has six cards, one loading status, no interactive placeholders, and reduced-motion support.

The admin dashboard remains usable for local products while API data loads or fails. It derives sorted unique category choices through `getAdminCategories(products)` and passes them to ProductEditor. The editor switches between a controlled category dropdown and a required new-name field, reuses canonical existing category names, and validates before calling the local mutation callback. Saving a product makes any new category available without separate category state. Delete opens a focused confirmation before applying the local deletion. Cancelling preserves the product. Cart controls only modify their saved snapshots; unavailable catalog products have disabled add buttons.

## Verification

Run the tests, lint, and build commands above. Focused tests cover credentials, draft validation/cent precision, category choices and duplicate-name handling, local CRUD, saved data validation and denied storage, cart duplicate additions/totals, quantity limits/removal, and existing API/filter/price behavior.

For live checking, run Vite and exercise invalid/valid login, create/edit/delete and cancellation, existing/new category selection and cancellation, category reuse after saving/refresh, stock changes, cart additions and quantities, removal/clear, browser history, refresh persistence, and small/large screen layouts. Confirm loading, retry, empty and success UI.

In React DevTools **Components**, expand `App` and compare the active branches and props above. Inspect App's catalog/demo/session/cart hooks; inspect ProductCatalog's filters, ProductCard's acknowledgement, and the admin form/dashboard state. Live DevTools inspection remains pending: the browser host is unavailable in this session and native Chrome control timed out waiting for app access. Responsive interaction and visual UI checks could not be completed through that fallback. Source checks and automated tests do not replace browser verification.
