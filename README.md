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
npm run typecheck
npm run format:check
npm run build
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Tests use Node's built-in runner and discover every `src/**/*.test.ts` file. React Router provides client-side navigation; login, admin, cart, and toasts use the existing React/CSS stack.

`npm run typecheck` checks both TypeScript projects without running Vite. `npm run build` runs the same type check before creating the production bundle. `npm run format:check` checks project formatting without changing files; use `npm run format` to apply the existing Prettier configuration. Generated output, the lockfile, and third-party skill bundles are excluded from formatting.

`.gitattributes` keeps text files at LF line endings so Git checkouts and formatting checks stay consistent across Windows and other platforms.

### Commit checks

`npm install` activates Husky through the `prepare` script. Before a normal commit, `.husky/pre-commit` runs the tasks in `lint-staged.config.mjs`: Oxlint checks staged `.ts` and `.tsx` files, Prettier checks supported staged files, and TypeScript checks the full project. All tasks run before lint-staged restores unstaged edits to partially staged files, so an unstaged correction cannot hide a staged type error in that file. The configuration function runs typecheck without appending staged filenames to the TypeScript command. Lint errors (including explicit `any`), formatting failures, and type errors stop the commit. Checks report problems without automatically rewriting or staging fixes.

The hook passes relative file paths and caps argument batches at 4,096 characters. This leaves room for npm command wrappers under Windows' 8,191-character command-line limit when many files are staged.

To run the hook manually after staging changes:

```sh
git hook run pre-commit
```

Local hooks can be bypassed; enforcing the same checks on pull requests requires CI.

### Agent instructions and Codex skills

`AGENTS.md` is the authoritative engineering rules file. `CLAUDE.md` contains the same rules for Claude tooling; keep both files byte-for-byte identical when updating conventions.

The repository includes both requested Vercel skills in Codex's project-scoped `.agents/skills/` directory:

- [Vercel React Best Practices](.agents/skills/vercel-react-best-practices/SKILL.md)
- [Vercel Composition Patterns](.agents/skills/vercel-composition-patterns/SKILL.md)

Both bundles include their individual rule files and compiled guides. Apply their React client guidance to this Vite frontend; Next.js/server-only rules apply only if the stack changes. Third-party skill contents are excluded from application linting and formatting to preserve the bundled examples.

[Codex discovers repository skills automatically](https://learn.chatgpt.com/docs/build-skills). If a newly added skill does not appear, restart Codex.

## Try the demo

Use **Admin login** in the header, or open `/login` / `/admin`.

Click anywhere on an API-backed product card, except its separate **Add to cart** button, to open `/products/:productId`, such as `/products/1`. Cards have hover/focus feedback and respect reduced-motion preferences. The page requests the individual API record and shows its category, price, availability, and cart action. Missing or invalid IDs show a not-found message; failed requests offer **Try again**. Browser-only demo products have no API detail route. Their cards and cart actions remain available.

Each loaded product page has **Comments** with a **Demo only** label. Enter a display name (up to 60 characters) and comment (up to 1,000 characters). Comments appear newest first and are saved separately for each product in this browser. They are not sent to the API or shared with other users. If saving fails, the comment remains available until you leave or refresh the page, and the section explains the limitation.

Routes use browser-history URLs. Vite supports direct route visits during development. In production, configure the static host to serve `index.html` for frontend routes such as `/products/1` and `/cart`.

| Field    | Demo value             |
| -------- | ---------------------- |
| Email    | `admin@shopboard.demo` |
| Password | `Admin123!`            |

The login page displays these credentials. Incorrect credentials show an error. A successful login opens the dashboard; **Sign out** returns to login. The simulated session lasts for the current tab and survives refresh when sessionStorage is available. These public credentials and the client-side gate provide no real authentication or backend authorization.

Create a product, edit its name/category/USD price/stock, or delete it after confirmation. Changes appear in the storefront and survive refresh in this browser. API products are never changed remotely: the shared client only reads products, and a local changes layer merges edits, additions, and deletions into the collection. Detail pages show the API record. Created products use negative IDs, which are retained after deletion to avoid reuse. Prices allow zero through 1,000,000 USD with at most two decimal places.

Choose an existing category from the product form's dropdown, or click **Create new category** to enter a name. **Use existing category** cancels the new name and restores the previous selection. Saving the product saves its category and makes it available for future products and storefront filtering. Names are trimmed, limited to 60 characters, and reuse matching existing categories regardless of capitalization. Categories are derived from products; empty categories are not saved independently.

Use **Manage categories → Delete** to remove a mistaken category. The confirmation shows how many products will move. Choose an existing replacement or type a new name; **Uncategorized** is suggested. Confirm with **Delete category and move products**, or cancel with **Keep category**. Product details and existing local edits are preserved, the old category disappears from dropdowns/filters, and the change survives refresh. To delete the last category, enter a different replacement name. Category deletion waits for the full API collection to load so no products are missed.

Use **Add to cart** on available products, then **Cart** in the header. Repeated additions increase quantity; use the cart's plus/minus buttons, remove an item, or clear the cart. Quantities range from 1 to 99. The header count includes all units. Line totals and the subtotal use integer cents and display USD. Checkout, orders, and payments are outside this demo.

| Storage        | Key                                 | Behavior                                                       |
| -------------- | ----------------------------------- | -------------------------------------------------------------- |
| localStorage   | `shopboard.catalog.v1`              | Versioned local product replacements/additions and deleted IDs |
| localStorage   | `shopboard.cart.v1`                 | Versioned product snapshots and quantities                     |
| localStorage   | `shopboard.comments.v1.<productId>` | Versioned demo comments for one product                        |
| sessionStorage | `shopboard.admin.session.v1`        | Simulated sign-in for this tab                                 |

Saved data is validated before use. Malformed data falls back safely; denied writes show persistence feedback and keep the current visit usable. Product edits/deletions do not alter existing cart snapshots. An accepted addition of the same available product refreshes its snapshot and price; additions at 99 units show a limit notice. Data is local to this browser and origin; no cross-tab synchronization or cross-device persistence is provided.

Action toasts confirm cart changes, login/logout, product/category changes, editing/cancellation, form errors, and retries. Cart additions include **View cart**. Success and information messages dismiss after six seconds; hovering or focusing a toast pauses the timer, which restarts when interaction ends. Errors stay until dismissed or displaced by newer messages. Each toast has a **Dismiss notification** button. At most three messages are shown, and identical repeated messages replace their earlier copy. Notifications remain across page navigation, use polite status or assertive error announcements, respect reduced motion, and do not move focus. Inline form/request/storage feedback remains visible; toasts announce action outcomes, including when changes only survive for the current visit.

## Project structure

Each feature separates UI in `components/` from non-UI responsibilities in `modules/`. Components own their folders and CSS. Larger collections group related component folders by responsibility. Tests live beside their modules. Components may import modules; modules never import components. Features communicate through the application layer and explicit callbacks.

```text
src/
  app/
    App.tsx                         # Composition and cross-feature coordination
    App.css                         # Shell, route loading, and unmatched-route feedback
    lazyPage.ts                     # Typed lazy imports with page-download recovery
    components/
      CartProvider/                 # One cart owner above the lazy routes
      CollectionPage/               # Lazy collection route composition and heading
      PageLoadError/                # Reload feedback for a failed page download
      ProductDetailsPage/           # Lazy product route and cart coordination
      StoreHeader/                  # Navigation, cart count, session controls
      StoreIntro/                   # Collection introduction
      StoreFooter/                  # Store footer
    modules/navigation/storePage.ts # Router-matched titles and catalog loading
  features/
    admin/
      components/
        Login/                      # Credentials, form, errors
        AdminDashboard/             # CRUD composition, status, delete confirmation
        ProductEditor/              # Validated create/edit form
        AdminProductList/           # Product summaries and actions
        CategoryManager/            # Category deletion, replacement, and confirmation
      modules/
        session/                    # Demo credential/session helpers and hook
        catalog/                    # Form/category validation, choices, and admin's prop model
    cart/
      components/
        Cart/                       # Empty/populated cart and subtotal
        CartLine/                   # Quantity and removal controls
      modules/cart/                 # Cart rules, types, storage, price, context, state/consumer hooks
    products/
      components/
        Products/                   # Request feedback and catalog composition
        catalog/                    # ProductCatalog, ProductGrid, ProductCard
        details/                    # ProductDetails and its request-state UI
        comments/                   # ProductComments list and local form
        filtering/                  # ProductFilters, ProductToolbar
        loading/                    # ProductLoading and skeletons
        feedback/                   # ProductError and ProductEmptyState
      modules/
        catalog/                    # Collection/single-product API, validation, model, collection hook
        details/                    # Product route ID validation and request lifecycle
        comments/                   # Comment validation, per-product storage, and state hook
        demo/                       # Local changes, validation, storage, state hook
        filtering/                  # Filter/sort rules, types, and state hook
        pricing/                    # USD formatting
  shared/
    api/apiClient.ts                # Base URL, HTTP, JSON parsing, errors
    components/
      Toast/                        # Notification content, dismissal, paused timer
      ToastRegion/                  # Persistent responsive notification list
    modules/toasts/                 # Types, bounded queue, timer lifecycle, state hook
    styles/global.css               # Resets, variables, focus styles, typography
    styles/typography.css           # Shared eyebrow style
  main.tsx                          # Global styles and React mounting
```

Import files directly; there are no re-export barrels. Product-specific shared feedback and skeleton CSS live in `components/feedback/productFeedback.css` and `components/loading/productSkeleton.css`. Every other component stylesheet is colocated. No feature imports another feature. Admin and cart own structural product contracts; the application layer passes compatible catalog values and callbacks between features. `CartProvider` owns the cart through `useCartState(notify)` and exposes it through the cart feature's context. `useCart()` reads that shared instance and reports a missing provider. Collection and product route composition forward the provider's add action to product UI.

## Component tree

This tree includes every component file, its configurable props, and conditional mounting. Each file declares a typed `Props` interface. `none` means no configurable props. React Router's provider and routing primitives are omitted. Types and callback signatures follow the tree.

```text
App — src/app/App.tsx
Props: none
└── CartProvider [always mounted above the shell and lazy routes]
    File: src/app/components/CartProvider/CartProvider.tsx
    Props: { children: ReactNode; notify: Notify }
    ├── StoreHeader — src/app/components/StoreHeader/StoreHeader.tsx
    │   Props: { signedIn: boolean; onLogout: () => void }; reads cart count with useCart().
    ├── PageLoadError [the requested page import fails]
    │   File: src/app/components/PageLoadError/PageLoadError.tsx
    │   Props: none; forwarded page props are ignored.
    ├── CollectionPage [/; lazy]
    │   File: src/app/components/CollectionPage/CollectionPage.tsx
    │   Props: { state: CatalogState; products: Product[]; onRetry: () => void }
    │   Reads the add action with useCart() and supplies it to Products.
    │   ├── StoreIntro [collection page]
    │   │   File: src/app/components/StoreIntro/StoreIntro.tsx
    │   │   Props: none
    │   └── Products
    │       File: src/features/products/components/Products/Products.tsx
    │       Props: { state: CatalogState; products: Product[]; onRetry: () => void;
    │                onAddToCart: (product: Product) => void }
    │       ├── ProductLoading [loading only]
    │       │   File: src/features/products/components/loading/ProductLoading/ProductLoading.tsx
    │       │   Props: none
    │       │   ├── ProductFiltersSkeleton
    │       │   │   File: src/features/products/components/loading/ProductFiltersSkeleton/ProductFiltersSkeleton.tsx
    │       │   │   Props: none
    │       │   └── ProductCardSkeleton [six stable placeholder slots]
    │       │       File: src/features/products/components/loading/ProductCardSkeleton/ProductCardSkeleton.tsx
    │       │       Props: none
    │       ├── ProductError [error only]
    │       │   File: src/features/products/components/feedback/ProductError/ProductError.tsx
    │       │   Props: { message: string; onRetry: () => void }
    │       └── ProductCatalog [success, or error with saved local products]
    │           File: src/features/products/components/catalog/ProductCatalog/ProductCatalog.tsx
    │           Props: { products: Product[]; onAddToCart: (product: Product) => void }
    │           ├── ProductFilters
    │           │   File: src/features/products/components/filtering/ProductFilters/ProductFilters.tsx
    │           │   Props: { filters: ProductFilters; categories: string[];
    │           │            onChange: (filters: ProductFilters) => void; onReset: () => void }
    │           ├── ProductToolbar
    │           │   File: src/features/products/components/filtering/ProductToolbar/ProductToolbar.tsx
    │           │   Props: { matchingCount: number; totalCount: number; sort: SortOrder;
    │           │            onSortChange: (value: string) => void }
    │           ├── ProductGrid [one or more matches]
    │           │   File: src/features/products/components/catalog/ProductGrid/ProductGrid.tsx
    │           │   Props: { products: Product[]; onAddToCart: (product: Product) => void }
    │           │   └── ProductCard [one per matching product; key: product.id]
    │           │       File: src/features/products/components/catalog/ProductCard/ProductCard.tsx
    │           │       Props: { product: Product; onAddToCart: (product: Product) => void }
    │           └── ProductEmptyState [no matches, including an empty catalog]
    │               File: src/features/products/components/feedback/ProductEmptyState/ProductEmptyState.tsx
    │               Props: { totalCount: number; onReset: () => void }
    ├── ProductDetailsPage [/products/:productId; lazy; key: pathname]
    │   File: src/app/components/ProductDetailsPage/ProductDetailsPage.tsx
    │   Props: none; reads the add action with useCart().
    │   └── ProductDetails
    │       File: src/features/products/components/details/ProductDetails/ProductDetails.tsx
    │       Props: { onAddToCart: (product: Product) => void }
    │       Loading, retryable error, not-found, and loaded content are mutually exclusive.
    │       └── ProductComments [loaded product only; key: product.id]
    │           File: src/features/products/components/comments/ProductComments/ProductComments.tsx
    │           Props: { productId: number }
    │           Empty message or comment list; validation, storage, and submission feedback are conditional.
    ├── Cart [/cart; lazy]
    │   File: src/features/cart/components/Cart/Cart.tsx
    │   Props: none; reads cart state and mutation actions with useCart().
    │   └── CartLine [one per saved product; key: item.id; absent when empty]
    │       File: src/features/cart/components/CartLine/CartLine.tsx
    │       Props: { item: CartItem; onQuantityChange: (productId: number, quantity: number) => void;
    │                onRemove: (productId: number) => void }
    ├── Login [/login while signed out; /admin redirects here when signed out]
    │   File: src/features/admin/components/Login/Login.tsx
    │   Props: { onLogin: (email: string, password: string) => boolean }
    ├── AdminDashboard [/admin while signed in; /login redirects here when signed in]
    │   File: src/features/admin/components/AdminDashboard/AdminDashboard.tsx
    │   Props: { products: AdminProduct[]; catalogStatus: 'loading' | 'error' | 'success';
    │            catalogError: string | null; storageError: string | null; onRetry: () => void;
    │            onCreate: (draft: AdminProductDraft) => void;
    │            onUpdate: (id: number, draft: AdminProductDraft) => void;
    │            onDelete: (id: number) => void;
    │            onDeleteCategory: (category: string, replacement: string) => void;
    │            onNotify: Notify }
    │   ├── ProductEditor [key: formRevision; remounts when saving, editing, or cancelling]
    │   │   File: src/features/admin/components/ProductEditor/ProductEditor.tsx
    │   │   Props: { product: AdminProduct | null; categories: string[];
    │   │            category: string; onCategoryChange: (category: string) => void;
    │   │            onSave: (draft: AdminProductDraft) => void;
    │   │            onCancel: () => void; onNotify: Notify }
    │   ├── AdminProductList
    │   │   File: src/features/admin/components/AdminProductList/AdminProductList.tsx
    │   │   Props: { products: AdminProduct[]; onEdit: (product: AdminProduct) => void;
    │   │            onRequestDelete: (product: AdminProduct) => void }
    │   └── CategoryManager
    │       File: src/features/admin/components/CategoryManager/CategoryManager.tsx
    │       Props: { products: AdminProduct[]; categories: string[];
    │                catalogStatus: 'loading' | 'error' | 'success';
    │                onDelete: (category: string, replacement: string) => void; onNotify: Notify }
    │       Confirmation form mounts only while pendingCategory is selected.
    ├── StoreFooter — src/app/components/StoreFooter/StoreFooter.tsx
    │   Props: none
    └── ToastRegion [always mounted across pages]
        File: src/shared/components/ToastRegion/ToastRegion.tsx
        Props: { toasts: ToastMessage[]; announcement: ToastMessage | null;
                 onDismiss: (id: number) => void }
        └── Toast [one per queued message; key: toast.id; absent when queue is empty]
            File: src/shared/components/Toast/Toast.tsx
            Props: { toast: ToastMessage; onDismiss: (id: number) => void }
            Action link renders only when toast.action is provided.
```

`src/main.tsx` mounts `App` inside `BrowserRouter` and React's `StrictMode`. HTML elements, fragments, hooks, and library internals are omitted. There are 30 application components including cart ownership, route composition, route recovery, product details, comments, and shared notification UI.

`App` declares the `/`, `/products/:productId`, `/cart`, `/login`, and `/admin` routes with React Router. An unmatched route displays a page-not-found message. `Link` and `NavLink` preserve application state during navigation; `Navigate` handles the demo session redirects. The skip link focuses the current main content without changing pages. `getStorePageTitle(pathname)` names the active route for the document title.

`CollectionPage`, `ProductDetailsPage`, `Cart`, `Login`, and `AdminDashboard` use module-scope `lazyPage` declarations backed by `React.lazy`. Each page and its styles load when that page first renders; React caches the loaded module for later visits. A pathname-keyed `Suspense` boundary displays **Loading page…** while code downloads. The helper catches failed imports and displays `PageLoadError` with an explicit **Reload page** action. `CartProvider`, the header, footer, notifications, session state, and shared data hooks remain mounted outside this boundary. Redirected or unopened pages do not trigger their lazy imports.

`Product` is `{ id: number; title: string; category: string; priceCents: number; inStock: boolean }`. Admin's independent `AdminProduct` and cart's independent `CartProduct` have the same shape. `AdminProductDraft` omits `id`; `CartItem` extends `CartProduct` with `quantity: number`. `CatalogState` is `{ status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; products: Product[] }`.

`ProductFilters` is `{ query: string; category: string; stockOnly: boolean; sort: SortOrder }`; the component imports it as `Filters`. `SortOrder` is `'name' | 'price-asc' | 'price-desc'`.

`Notify` is `(notification: ToastInput) => void`. `ToastInput` is `{ message: string; variant: 'success' | 'error' | 'info'; action?: { label: string; href: string } }`. `ToastMessage` adds a distinct numeric `id`. Shared toast modules import no application or feature code.

## State ownership and data flow

| Owner                                                       | State / source                                                     | Behavior                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrowserRouter`; `App` uses `useLocation` and `useNavigate` | Browser-history location                                           | Drives routes and internal navigation; title and main-content focus synchronize with page/session changes                                          |
| `App`, `useProducts(needsCatalog)`                          | API `state` and retry `attempt`                                    | Requests the collection on collection/admin routes; validates results, supports retry, and cancels requests when disabled or unmounted             |
| `App`, `useDemoCatalog(baseProducts, notify)`               | Local `catalog` changes and storage error                          | Restores saved edits; actions persist and notify their actual outcomes; derives merged products                                                    |
| `App`, `useDemoAuth()`                                      | `signedIn`                                                         | Restores tab-scoped demo session; login checks credentials; logout clears the session                                                              |
| `CartProvider`, `useCartState(notify)`                      | One cart snapshot with items and persistence feedback              | Restores snapshots; stable actions persist and notify changes, failures and limits; derives count and total; useCart() shares the value            |
| `App`, `useToasts()`                                        | Reducer queue, announcement event, and next ID ref                 | Owns up to three deduplicated toasts plus independent announcement state; stable notify/dismiss callbacks                                          |
| `ProductCatalog`, `useProductFilters(products)`             | One filters object                                                 | Defaults to empty query/category, stock-only false, name sort; reset restores defaults                                                             |
| `ProductDetails`, `useProduct(productId)`                   | Selected product result and retry `attempt`                        | Requests the ID endpoint, distinguishes 404 from retryable errors, and aborts stale/unmounted requests; remounts when the product pathname changes |
| `ProductComments`, `useProductComments(productId)`          | Comment list, storage feedback, form error, and submission message | Restores the product's comments, validates submissions, prepends and persists comments, and remounts when the product ID changes                   |
| `Login`                                                     | `error`                                                            | Keeps invalid-credential feedback visible; App announces login outcome through toast                                                               |
| `AdminDashboard`                                            | `editing`, `editorCategory`, `pendingDelete`, `formRevision`       | Owns the editor/category coordination and confirmations; publishes edit/cancel notices through Notify                                              |
| `ProductEditor`                                             | `error`, `creatingCategory`                                        | Owns category creation mode; reports category selection to Dashboard; other fields are native uncontrolled inputs                                  |
| `CategoryManager`                                           | `pendingCategory`, validation `error`                              | Owns deletion confirmation and replacement input; derives affected count; cancellation changes no products                                         |
| `Toast`                                                     | `isHovered`, `hasFocus`; effect-managed timeout                    | Pauses auto-dismiss during interaction, cleans up stale timers, and keeps errors until dismissed                                                   |

The cart, catalog, and comment hooks use refs only to retain the latest mutation snapshot for successive event-handler calls. They do not read those refs during rendering. Filtered products, categories, counts, prices, and merged catalog values are derived during rendering. `StoreHeader`, `CollectionPage`, `ProductDetailsPage`, and `Cart` read the same cart through `useCart()`; calling the consumer hook never creates another cart. All other components are stateless and report actions through props. Component-specific filters, forms, and comments retain their existing owners.

App passes the stable `notify` callback into `CartProvider`, the catalog hook, and admin controls. The cart context value is memoized and its actions retain their identity until notification dependencies change, so unrelated notification updates do not publish a new cart value. React Context fits this small shared cart without an additional store dependency. Mutation hooks report success only for completed changes; storage failures append the persistence warning to an error toast while preserving the in-memory change. Cart additions at the limit report a notice without claiming another unit was added. ProductCard is stateless and forwards add actions. Validation errors stay inline with form descriptions while ToastRegion owns their live announcement. Retry keeps the existing loading/error UI and announces that the retry started. Filters continue using their result count rather than generating toasts on every change.

ToastRegion keeps empty polite/status and assertive/alert announcement containers mounted from startup, updating their keyed content for each new action, including repeated identical messages. Dismissing a notification clears its current announcement without reviving older messages. Visible Toast components have no additional live roles. The visual list is newest first so recent feedback stays visible on short viewports.

`App` owns the collection lifecycle and enables requests where collection data is needed. A direct product detail visit requests only `/api/products/{id}`. Its response is validated by the same product parser as the collection; invalid route IDs do not start a request. The detail page shows loading feedback, retryable errors, HTTP 404 feedback, or the API product and its stock-aware cart action.

The collection renders a skeleton while loading, a retryable alert on failure, and the catalog on success. If the API fails but local products exist, they remain browsable under the error alert. Empty API results and filters with no matches have different feedback. The skeleton has six cards, one loading status, no interactive placeholders, and reduced-motion support.

The admin dashboard remains usable for local products while API data loads or fails. It derives sorted unique category choices through `getAdminCategories(products)` and passes them to ProductEditor. The editor switches between a controlled category dropdown and a required new-name field, reuses canonical existing category names, and validates before calling the local mutation callback. Saving a product makes any new category available without separate category state. Delete opens a focused confirmation before applying the local deletion. Cancelling preserves the product. Cart controls only modify their saved snapshots; unavailable catalog products have disabled add buttons.

CategoryManager lists those same categories and owns a focused category-deletion form with affected count, existing/new replacement suggestions, validation, confirmation, and cancellation. Controls stay disabled until the full catalog loads. Its action passes through AdminDashboard and App to `useDemoCatalog.deleteCategory`, which reassigns matching products in one saved local change. Deleted product IDs remain deleted. AdminDashboard also updates the controlled editor category immediately, so open create/edit forms follow the replacement without remounting or discarding other entered fields. Reusing an old category name cannot silently change that selection. Cart snapshots are unchanged.

## Verification

Run the tests, lint, typecheck, formatting, and build commands above. Focused tests cover single-product endpoint selection and mapping, route ID validation, 404/server errors, malformed or mismatched responses, cancellation, credentials, draft validation/cent precision, category choices, duplicate-name handling, deletion/reassignment and persistence, local CRUD, saved data validation and denied storage, cart duplicate additions/totals, quantity limits/removal, existing API/filter/price behavior, bounded/deduplicated toast queues, ID-specific dismissal, auto-dismiss timing, persistent errors, and stale timer cleanup.

For live checking, run Vite and exercise invalid/valid login, create/edit/delete and cancellation, existing/new category selection and cancellation, category deletion with replacement/cancellation and refresh, deleting the last category, open editor reconciliation, stock changes, cart additions and quantities, removal/clear, browser history, refresh persistence, and small/large screen layouts. Confirm loading, retry, empty and success UI.

Also check toast dismissal, six-second timing, hover/focus pause, persistent errors, repeated/rapid actions, cart limit and storage-error feedback, View cart navigation, and reduced-motion/mobile layouts.

For product details, follow a product title, open `/products/1` directly, refresh it, and use browser back/forward. Check an unavailable product, an unknown numeric ID, and malformed IDs. Confirm loading and retry behavior, add to cart and follow the toast action, and check narrow/wide layouts. Changing product routes during a slow request must not display the previous product's response.

Check card navigation from the artwork, metadata, title, and price. The cart button must add without navigating; keyboard focus and reduced-motion settings must remain usable. Post a demo comment, refresh, switch products, and return to confirm per-product persistence. Check blank/overlong fields, empty comments, multiline text, corrupt saved data, and unavailable browser storage.

In React DevTools **Components**, expand `App` and `CartProvider` and compare the active branches and props above. Inspect App's catalog/demo/session/toast hooks, CartProvider's single cart state hook and the consumers' shared context, ProductDetails' route and request state, ProductCatalog's filters, admin form/dashboard state, and each Toast's hover/focus flags.
