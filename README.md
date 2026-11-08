# ShopBoard

A React and TypeScript storefront built with Vite, plain CSS layouts, and shared shadcn/ui controls for the Corehub Istanbul software engineering course. Browse and filter the API collection, save products to a cart, complete a validated demo checkout, and try product management in a local admin demo.

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

Use **Add to cart** on available products, then **Cart** in the header. Repeated additions increase quantity; use the cart's plus/minus buttons, remove an item, or clear the cart. Quantities range from 1 to 99. The header count includes all units. Line totals and the subtotal use integer cents and display USD.

Choose **Continue to checkout** from a populated cart to open `/checkout`. Enter your name, email, street address, city, postal code, and country; apartment/suite and region are optional. Fields validate after you touch them, show specific inline errors, and focus the first invalid field when submitted. The cart summary stays alongside the form on wide screens and stacks below it on smaller screens. **Back to your cart** and **Edit cart** let you return to quantities before completing checkout.

**Complete demo checkout** validates the form, clears the shared cart, and displays a confirmation. The submit button is disabled while submitting. An empty cart shows a collection link instead of a form. Storage problems explain that old saved cart items may return after refresh. This is a browser-only demo: no real order, shipping quote, or payment is created. Contact/delivery details are never logged, saved, or sent to an API; leaving or refreshing checkout discards them.

React Hook Form owns checkout's values, touched flags, errors, and submission status. Its `zodResolver` uses the single schema in `features/checkout/modules/validation/checkout.schema.ts`, including trimming, field limits, optional fields, and email validation. Form types are inferred from that schema; there are no duplicate registration or component validation rules. See the official [React Hook Form integration](https://ui.shadcn.com/docs/forms/react-hook-form).

The shared Input, Label, and Button are adapted from shadcn/ui's [Input](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/input.tsx), [Label](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/label.tsx), and [Button](https://ui.shadcn.com/r/styles/new-york-v4/button.json) sources. They retain native/ref forwarding and accessible Radix composition while following this repository's component folders and JSDoc rules; the upstream MIT license is retained in `src/shared/components/ui/LICENSE`. `components.json` records the registry/theme/alias setup. Keep future added controls in their own component folders and import them directly. Class merging and button variants live under `shared/modules/ui/` to keep non-UI code separate.

Tailwind's Vite plugin compiles only the shared control/variant utilities through explicit source paths in `shared/styles/shadcn.css`. Its global Preflight reset is omitted, and feature/page layouts keep plain CSS. The theme maps control colors to the existing storefront variables. Checkout's controls, React Hook Form, resolver, Zod, and styles are loaded with the lazy checkout route.

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
    queryClient.ts                  # Single application API-data cache
    components/
      CartProvider/                 # One cart owner above the lazy routes
      RetryablePage/                # Page Suspense + Error Boundary and fresh lazy identity on retry
      AdminPage/                    # Persistent editor with independent API-list boundaries
      AdminProductPanel/            # Suspense-aware admin list query and feature coordination
      CheckoutPage/                 # Lazy checkout route and cart coordination
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
    checkout/
      components/
        Checkout/                   # Local form owner, validation, empty/success feedback
        CheckoutField/              # Registered input, label, autofill and inline error
        CheckoutSummary/            # Current cart lines, derived total, edit link
      modules/
        validation/                 # Single Zod schema, inferred types, defaults and tests
        summary/                    # Independent cart-line contract and USD display
    products/
      components/
        Products/                   # Request feedback and catalog composition
        catalog/                    # ProductCatalog, ProductGrid, ProductCard
                                    # SuspendedCatalog gates browsing on the shared request cache
        details/                    # ProductDetails and its request-state UI
        comments/                   # ProductComments list and local form
        filtering/                  # ProductFilters, ProductToolbar
        loading/                    # ProductLoading and skeletons
                                    # ProductDetailsLoading is the detail request's local fallback
        feedback/                   # ProductError and ProductEmptyState
      modules/
        catalog/                    # Collection/single-product API, validation, model, collection hook
                                    # Shared query options and cache/retry/cancellation tests
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
      RequestBoundary/              # Local Suspense, Error Boundary, and query reset coordination
      SectionError/                 # Section render/request recovery without losing surrounding UI
      ui/                           # shadcn/ui Button, Input, Label in their own folders; MIT license
    modules/toasts/                 # Types, bounded queue, timer lifecycle, state hook
    modules/ui/                     # Class merging and shadcn Button variants
    modules/errors/                 # Unknown request-error feedback
    modules/focus/                  # Stable confirmation mount focus
    styles/global.css               # Resets, variables, focus styles, typography
    styles/typography.css           # Shared eyebrow style
    styles/shadcn.css               # Tailwind control utilities and theme; no Preflight
  main.tsx                          # Global styles and React mounting
```

Import files directly; there are no re-export barrels. Product-specific shared feedback and skeleton CSS live in `components/feedback/productFeedback.css` and `components/loading/productSkeleton.css`. Every other component stylesheet is colocated. No feature imports another feature. Admin and cart own structural product contracts; the application layer passes compatible catalog values and callbacks between features. `CartProvider` owns the cart through `useCartState(notify)` and exposes it through the cart feature's context. `useCart()` reads that shared instance and reports a missing provider. Collection and product route composition forward the provider's add action to product UI.

## Component tree

This tree includes every component file, its configurable props, and conditional mounting. Each file declares a typed `Props` interface. `none` means no configurable props. React Router's provider and routing primitives are omitted. Types and callback signatures follow the tree.

```text
App — src/app/App.tsx
Props: none
└── CartProvider — src/app/components/CartProvider/CartProvider.tsx
    Props: { children: ReactNode; notify: Notify }; owns one persistent cart.
    ├── StoreHeader — src/app/components/StoreHeader/StoreHeader.tsx
    │   Props: { signedIn: boolean; onLogout: () => void }; reads cart count with useCart().
    ├── RetryablePage [one active matched route; key: pathname]
    │   File: src/app/components/RetryablePage/RetryablePage.tsx
    │   Props: { load: () => Promise<{ default: ComponentType<PageProps> }>; pageProps: PageProps }
    │   Owns the lazy identity; Suspense shows Loading page…; Error Boundary catches imports/renders.
    │   ├── PageLoadError [page failure only]
    │   │   File: src/app/components/PageLoadError/PageLoadError.tsx
    │   │   Props: { resetErrorBoundary: () => void }; offers Try again and Reload page.
    │   ├── CollectionPage [/]
    │   │   File: src/app/components/CollectionPage/CollectionPage.tsx
    │   │   Props: { products: Product[]; onRetry: () => void }; reads the cart add action.
    │   │   ├── StoreIntro — src/app/components/StoreIntro/StoreIntro.tsx
    │   │   │   Props: none; remains visible while catalog data loads or fails.
    │   │   └── Products — src/features/products/components/Products/Products.tsx
    │   │       Props: { products: Product[]; onRetry: () => void; onAddToCart: (product: Product) => void }
    │   │       └── RequestBoundary — src/shared/components/RequestBoundary/RequestBoundary.tsx
    │   │           Props: { children: ReactNode; loading: ReactNode; onRetry?: () => void;
    │   │                    renderError?: (props: RequestErrorProps) => ReactNode }
    │   │           QueryErrorResetBoundary + ErrorBoundary + Suspense isolate this request section.
    │   │           ├── ProductLoading [pending request only]
    │   │           │   File: src/features/products/components/loading/ProductLoading/ProductLoading.tsx
    │   │           │   Props: none
    │   │           │   ├── ProductFiltersSkeleton
    │   │           │   │   File: src/features/products/components/loading/ProductFiltersSkeleton/ProductFiltersSkeleton.tsx
    │   │           │   │   Props: none
    │   │           │   └── ProductCardSkeleton [six placeholders]
    │   │           │       File: src/features/products/components/loading/ProductCardSkeleton/ProductCardSkeleton.tsx
    │   │           │       Props: none
    │   │           ├── ProductError [request/render failure; saved products stay browsable below it]
    │   │           │   File: src/features/products/components/feedback/ProductError/ProductError.tsx
    │   │           │   Props: { message: string; onRetry: () => void }
    │   │           │   The fallback may also render ProductCatalog with saved products inside its own Error Boundary.
    │   │           └── SuspendedCatalog [ready request]
    │   │               File: src/features/products/components/catalog/SuspendedCatalog/SuspendedCatalog.tsx
    │   │               Props: { products: Product[]; onAddToCart: (product: Product) => void }
    │   │               Reads the shared cache; owns no copied catalog data.
    │   │               └── ProductCatalog — src/features/products/components/catalog/ProductCatalog/ProductCatalog.tsx
    │   │                   Props: { products: Product[]; onAddToCart: (product: Product) => void }; owns filters.
    │   │                   ├── ProductFilters — src/features/products/components/filtering/ProductFilters/ProductFilters.tsx
    │   │                   │   Props: { filters: ProductFilters; categories: string[];
    │   │                   │            onChange: (filters: ProductFilters) => void; onReset: () => void }
    │   │                   ├── ProductToolbar — src/features/products/components/filtering/ProductToolbar/ProductToolbar.tsx
    │   │                   │   Props: { matchingCount: number; totalCount: number; sort: SortOrder;
    │   │                   │            onSortChange: (value: string) => void }
    │   │                   ├── ProductGrid [one or more matches]
    │   │                   │   File: src/features/products/components/catalog/ProductGrid/ProductGrid.tsx
    │   │                   │   Props: { products: Product[]; onAddToCart: (product: Product) => void }
    │   │                   │   └── ProductCard [one per product; key: product.id]
    │   │                   │       File: src/features/products/components/catalog/ProductCard/ProductCard.tsx
    │   │                   │       Props: { product: Product; onAddToCart: (product: Product) => void }
    │   │                   └── ProductEmptyState [empty catalog or no filter matches]
    │   │                       File: src/features/products/components/feedback/ProductEmptyState/ProductEmptyState.tsx
    │   │                       Props: { totalCount: number; onReset: () => void }; reset appears only for no matches.
    │   ├── ProductDetailsPage [/products/:productId]
    │   │   File: src/app/components/ProductDetailsPage/ProductDetailsPage.tsx
    │   │   Props: none; reads cart add action; wraps the selected product in RequestBoundary.
    │   │   └── RequestBoundary [as above]
    │   │       ├── ProductDetailsLoading [pending request]
    │   │       │   File: src/features/products/components/loading/ProductDetailsLoading/ProductDetailsLoading.tsx
    │   │       │   Props: none
    │   │       ├── SectionError [request/render failure]
    │   │       │   File: src/shared/components/SectionError/SectionError.tsx
    │   │       │   Props: { resetErrorBoundary: () => void }; also handles comments/fallback render failures.
    │   │       └── ProductDetails — src/features/products/components/details/ProductDetails/ProductDetails.tsx
    │   │           Props: { onAddToCart: (product: Product) => void }; reads one cached product or shows not-found.
    │   │           └── ProductComments [loaded product only; Error Boundary keyed by product.id]
    │   │               File: src/features/products/components/comments/ProductComments/ProductComments.tsx
    │   │               Props: { productId: number }; owns comments/form feedback; SectionError replaces only comments on render failure.
    │   ├── Cart [/cart] — src/features/cart/components/Cart/Cart.tsx
    │   │   Props: none; reads shared cart; empty/populated branches and storage feedback are conditional.
    │   │   └── CartLine [one per saved product; key: item.id; absent when empty]
    │   │       File: src/features/cart/components/CartLine/CartLine.tsx
    │   │       Props: { item: CartItem; onQuantityChange: (productId: number, quantity: number) => void;
    │   │                onRemove: (productId: number) => void }
    │   ├── CheckoutPage [/checkout] — src/app/components/CheckoutPage/CheckoutPage.tsx
    │   │   Props: none; reads shared cart and forwards its clear action.
    │   │   └── Checkout — src/features/checkout/components/Checkout/Checkout.tsx
    │   │       Props: { items: CheckoutItem[]; totalCents: number; storageError: string | null; onComplete: () => void }
    │   │       Owns useForm(); success, empty-cart, and active-form branches are mutually exclusive.
    │   │       ├── Button [back/submit in form; collection link when empty/successful]
    │   │       │   File: src/shared/components/ui/Button/Button.tsx
    │   │       │   Props: native button/ref attributes; variant?: 'default' | 'outline'; asChild?: boolean
    │   │       │   asChild renders a router link through Radix Slot; pending submit is disabled.
    │   │       ├── CheckoutField [eight fields; active form only; shared FormProvider]
    │   │       │   File: src/features/checkout/components/CheckoutField/CheckoutField.tsx
    │   │       │   Props: { name: keyof CheckoutInput; label: string; autoComplete: string;
    │   │       │            type?: 'text' | 'email'; optional?: boolean }; subscribes to its own error.
    │   │       │   ├── Label — src/shared/components/ui/Label/Label.tsx
    │   │       │   │   Props: native Radix Label attributes/ref, including htmlFor and children
    │   │       │   └── Input — src/shared/components/ui/Input/Input.tsx
    │   │       │       Props: native input attributes/ref, including register(), autofill and ARIA props
    │   │       │       Inline errors appear only for invalid fields.
    │   │       └── CheckoutSummary [active form only]
    │   │           File: src/features/checkout/components/CheckoutSummary/CheckoutSummary.tsx
    │   │           Props: { items: CheckoutItem[]; totalCents: number }; derives line prices and offers Edit cart.
    │   ├── Login [/login signed out; signed-out /admin redirects here]
    │   │   File: src/features/admin/components/Login/Login.tsx
    │   │   Props: { onLogin: (email: string, password: string) => boolean }; owns credential error.
    │   └── AdminPage [/admin signed in; signed-in /login redirects here]
    │       File: src/app/components/AdminPage/AdminPage.tsx
    │       Props: Omit<DashboardProps, 'renderProducts'> & { onRetry: () => void }
    │       └── AdminDashboard — src/features/admin/components/AdminDashboard/AdminDashboard.tsx
    │           Props: DashboardProps (defined below); owns editing/category/delete confirmation and form revision.
    │           ├── ProductEditor [key: formRevision; changes on save/edit/cancel, not API completion]
    │           │   File: src/features/admin/components/ProductEditor/ProductEditor.tsx
    │           │   Props: { product: AdminProduct | null; categories: string[]; category: string;
    │           │            onCategoryChange: (category: string) => void; onSave: (draft: AdminProductDraft) => void;
    │           │            onCancel: () => void; onNotify: Notify }
    │           ├── RequestBoundary [in one Admin products panel; supplied through renderProducts]
    │           │   ├── AdminProductList [saved local records during loading/failure]
    │           │   │   File: src/features/admin/components/AdminProductList/AdminProductList.tsx
    │           │   │   Props: ProductListProps (defined below); empty feedback only when the loaded list is empty.
    │           │   └── AdminProductPanel [ready API request]
    │           │       File: src/app/components/AdminProductPanel/AdminProductPanel.tsx
    │           │       Props: ProductListProps; reads shared cache and renders AdminProductList.
    │           │       Error fallback offers retry and saved records; an extra SectionError boundary contains list-render failures.
    │           └── CategoryManager — src/features/admin/components/CategoryManager/CategoryManager.tsx
    │               Props: { products: AdminProduct[]; categories: string[]; catalogStatus: 'loading' | 'error' | 'success';
    │                        onDelete: (category: string, replacement: string) => void; onNotify: Notify }
    │               Owns pending category/error; confirmation form is keyed by category and focused on mount.
    ├── StoreFooter — src/app/components/StoreFooter/StoreFooter.tsx
    │   Props: none
    └── ToastRegion — src/shared/components/ToastRegion/ToastRegion.tsx
        Props: { toasts: ToastMessage[]; announcement: ToastMessage | null; onDismiss: (id: number) => void }
        └── Toast [one per queued message; key: toast.id; absent when empty]
            File: src/shared/components/Toast/Toast.tsx
            Props: { toast: ToastMessage; onDismiss: (id: number) => void }; owns hover/focus and timeout.
            Action link appears only when toast.action is provided.
```

`ProductListProps` is `{ products: AdminProduct[]; onEdit: (product: AdminProduct) => void; onRequestDelete: (product: AdminProduct) => void }`. `RequestErrorProps` is `{ error: unknown; resetErrorBoundary: () => void }`.

`DashboardProps` is `{ products: AdminProduct[]; catalogStatus: 'loading' | 'error' | 'success'; storageError: string | null; renderProducts: (props: ProductListProps) => ReactNode; onCreate: (draft: AdminProductDraft) => void; onUpdate: (id: number, draft: AdminProductDraft) => void; onDelete: (id: number) => void; onDeleteCategory: (category: string, replacement: string) => void; onNotify: Notify }`. AdminPage supplies `renderProducts` to coordinate features through the application layer.

`src/main.tsx` mounts `App` inside one `QueryClientProvider`, `BrowserRouter`, and React's `StrictMode`. HTML elements, fragments, hooks, and library internals are omitted. There are 44 application components including the request/page boundaries and independent admin panel.

`App` declares the `/`, `/products/:productId`, `/cart`, `/checkout`, `/login`, and `/admin` routes with React Router. An unmatched route displays a page-not-found message. `Link` and `NavLink` preserve application state during navigation; `Navigate` handles the demo session redirects. The skip link focuses the current main content without changing pages. `getStorePageTitle(pathname)` names the active route for the document title. Checkout does not fetch the catalog on a direct visit.

`CollectionPage`, `ProductDetailsPage`, `Cart`, `CheckoutPage`, `Login`, and `AdminPage` have module-scope loader functions passed to a pathname-keyed `RetryablePage`. That component owns a stable lazy identity and combines Suspense's **Loading page…** with an Error Boundary. **Try again** recreates only that lazy identity, so failed downloads can be attempted again; **Reload page** also handles stale deployment assets. Successful module imports remain cached by the browser. `CartProvider`, header, footer, notifications, session state, and request observers stay outside the page boundary. Redirected or unopened pages do not trigger their module imports.

Collection data, product details, and the admin product panel each use `RequestBoundary`: a local Suspense fallback plus cache-aware Error Boundary recovery. `@tanstack/react-query` owns one API cache instead of copied hook state; `react-error-boundary` provides resettable boundaries while application components stay functions. This follows the libraries' [Suspense/error reset integration](https://tanstack.com/query/latest/docs/framework/react/guides/suspense). The catalog skeleton can load while the introduction remains visible. Details have their own placeholders and a separate comments boundary. Admin's editor/categories stay mounted while only its API list loads or fails, and saved local products remain editable in that panel. No artificial loading delays are added.

Queries share typed options, validate responses through the existing API files, stay fresh for one minute, and use explicit retries rather than automatic delays or focus/reconnect refreshes. Root request-lifetime synchronization cancels departing requests even before a suspended detail component mounts; this is necessary because [Suspense query cancellation needs explicit handling](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation). Empty results and no-match filters remain successful UI states. Pending and failure fallbacks are local, and successful retries cannot reset unrelated forms or persistent cart state.

`Product` is `{ id: number; title: string; category: string; priceCents: number; inStock: boolean }`. Admin's independent `AdminProduct` and cart's independent `CartProduct` have the same shape. `AdminProductDraft` omits `id`; `CartItem` extends `CartProduct` with `quantity: number`. `CatalogState` is `{ status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; products: Product[] }`.

`ProductFilters` is `{ query: string; category: string; stockOnly: boolean; sort: SortOrder }`; the component imports it as `Filters`. `SortOrder` is `'name' | 'price-asc' | 'price-desc'`.

`Notify` is `(notification: ToastInput) => void`. `ToastInput` is `{ message: string; variant: 'success' | 'error' | 'info'; action?: { label: string; href: string } }`. `ToastMessage` adds a distinct numeric `id`. Shared toast modules import no application or feature code.

`CheckoutItem` is `{ id: number; title: string; priceCents: number; quantity: number }`, independently owned by checkout and structurally compatible with saved cart lines. `CheckoutInput` and `CheckoutValues` are the Zod schema's inferred input and normalized output; they contain full name, email, two address lines, city, region, postal code and country. Optional address line 2 and region normalize to empty strings. There is no order API contract in this demo.

## State ownership and data flow

| Owner                                                              | State / source                                                     | Behavior                                                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrowserRouter`; `App` uses `useLocation` and `useNavigate`        | Browser-history location                                           | Drives routes and internal navigation; title and main-content focus synchronize with page/session changes                                         |
| `QueryClient`; `App` observes with `useProducts(needsCatalog)`     | Validated catalog, pending request and error in one cache entry    | App derives CatalogState without copying results; catalog/section readers share this entry; explicit retry and cancellation preserve other data   |
| `App`, `useDemoCatalog(baseProducts, notify)`                      | Local `catalog` changes and storage error                          | Restores saved edits; actions persist and notify their actual outcomes; derives merged products                                                   |
| `App`, `useDemoAuth()`                                             | `signedIn`                                                         | Restores tab-scoped demo session; login checks credentials; logout clears the session                                                             |
| `CartProvider`, `useCartState(notify)`                             | One cart snapshot with items and persistence feedback              | Restores snapshots; stable actions persist and notify changes, failures and limits; derives count and total; useCart() shares the value           |
| `Checkout`, `useForm()`                                            | Form values, touched state, errors, submitting/success status      | Sole form owner; Zod resolver validates/normalizes; FormProvider shares registration with fields; successful demo completion clears provider cart |
| `App`, `useToasts()`                                               | Reducer queue, announcement event, and next ID ref                 | Owns up to three deduplicated toasts plus independent announcement state; stable notify/dismiss callbacks                                         |
| `ProductCatalog`, `useProductFilters(products)`                    | One filters object                                                 | Defaults to empty query/category, stock-only false, name sort; reset restores defaults                                                            |
| `QueryClient`; `ProductDetails` reads with `useProduct(productId)` | Per-ID validated product or not-found result                       | Suspends for loading, throws request errors to the local boundary, and keeps product keys independent; root route lifetime handles aborts         |
| `ProductComments`, `useProductComments(productId)`                 | Comment list, storage feedback, form error, and submission message | Restores the product's comments, validates submissions, prepends and persists comments, and remounts when the product ID changes                  |
| `Login`                                                            | `error`                                                            | Keeps invalid-credential feedback visible; App announces login outcome through toast                                                              |
| `AdminDashboard`                                                   | `editing`, `editorCategory`, `pendingDelete`, `formRevision`       | Owns the editor/category coordination and confirmations; publishes edit/cancel notices through Notify                                             |
| `ProductEditor`                                                    | `error`, `creatingCategory`                                        | Owns category creation mode; reports category selection to Dashboard; other fields are native uncontrolled inputs                                 |
| `CategoryManager`                                                  | `pendingCategory`, validation `error`                              | Owns deletion confirmation and replacement input; derives affected count; cancellation changes no products                                        |
| `Toast`                                                            | `isHovered`, `hasFocus`; effect-managed timeout                    | Pauses auto-dismiss during interaction, cleans up stale timers, and keeps errors until dismissed                                                  |

The cart, catalog, and comment hooks use refs only to retain the latest mutation snapshot for successive event-handler calls. They do not read those refs during rendering. Filtered products, categories, counts, prices, and merged catalog values are derived during rendering. `StoreHeader`, `CollectionPage`, `ProductDetailsPage`, `CheckoutPage`, and `Cart` read the same cart through `useCart()`; calling the consumer hook never creates another cart. Checkout fields subscribe to their own React Hook Form errors and register native inputs through the shared form context. They store no copied values, errors or totals. Component-specific filters, forms, and comments retain their existing owners.

App passes the stable `notify` callback into `CartProvider`, the catalog hook, and admin controls. The cart context value is memoized and its actions retain their identity until notification dependencies change, so unrelated notification updates do not publish a new cart value. React Context fits this small shared cart without an additional store dependency. Mutation hooks report success only for completed changes; storage failures append the persistence warning to an error toast while preserving the in-memory change. Cart additions at the limit report a notice without claiming another unit was added. ProductCard is stateless and forwards add actions. Validation errors stay inline with form descriptions while ToastRegion owns their live announcement. Retry keeps the existing loading/error UI and announces that the retry started. Filters continue using their result count rather than generating toasts on every change.

ToastRegion keeps empty polite/status and assertive/alert announcement containers mounted from startup, updating their keyed content for each new action, including repeated identical messages. Dismissing a notification clears its current announcement without reviving older messages. Visible Toast components have no additional live roles. The visual list is newest first so recent feedback stays visible on short viewports.

`App` owns the collection lifecycle and enables requests where collection data is needed. A direct product detail visit requests only `/api/products/{id}`. Its response is validated by the same product parser as the collection; invalid route IDs do not start a request. The detail page shows loading feedback, retryable errors, HTTP 404 feedback, or the API product and its stock-aware cart action.

The collection's request boundary renders a skeleton while loading, a retryable alert on failure, and the catalog on success. If the API fails but local products exist, they remain browsable under the error alert, with their own render-error containment. Empty API results and filters with no matches have different feedback. The skeleton has six cards, one loading status, no interactive placeholders, and reduced-motion support.

The admin dashboard remains usable for local products while API data loads or fails. It derives sorted unique category choices through `getAdminCategories(products)` and passes them to ProductEditor. The editor switches between a controlled category dropdown and a required new-name field, reuses canonical existing category names, and validates before calling the local mutation callback. Saving a product makes any new category available without separate category state. Delete opens a focused confirmation before applying the local deletion. Cancelling preserves the product. Cart controls only modify their saved snapshots; unavailable catalog products have disabled add buttons.

CategoryManager lists those same categories and owns a focused category-deletion form with affected count, existing/new replacement suggestions, validation, confirmation, and cancellation. Controls stay disabled until the full catalog loads. Its action passes through AdminDashboard and App to `useDemoCatalog.deleteCategory`, which reassigns matching products in one saved local change. Deleted product IDs remain deleted. AdminDashboard also updates the controlled editor category immediately, so open create/edit forms follow the replacement without remounting or discarding other entered fields. Reusing an old category name cannot silently change that selection. Cart snapshots are unchanged.

## Verification

Run the tests, lint, typecheck, formatting, and build commands above. Focused tests cover single-product endpoint selection and mapping, route ID validation, 404/server errors, malformed or mismatched responses, cancellation, credentials, draft validation/cent precision, category choices, duplicate-name handling, deletion/reassignment and persistence, local CRUD, saved data validation and denied storage, cart duplicate additions/totals, quantity limits/removal, existing API/filter/price behavior, bounded/deduplicated toast queues, ID-specific dismissal, auto-dismiss timing, persistent errors, and stale timer cleanup.

For live checking, run Vite and exercise invalid/valid login, create/edit/delete and cancellation, existing/new category selection and cancellation, category deletion with replacement/cancellation and refresh, deleting the last category, open editor reconciliation, stock changes, cart additions and quantities, removal/clear, browser history, refresh persistence, and small/large screen layouts. Confirm loading, retry, empty and success UI.

DOM tests use the existing Node runner, jsdom, and Vite's in-memory TSX compiler; they open no browser or HTTP server. They exercise actual boundary components and the full application for pending/error/retry isolation, failed-import retry, preserved neighboring/admin drafts, header identity, empty-catalog navigation, and StrictMode request cancellation. Query tests cover one catalog cache entry, independent detail keys, validated responses, explicit retry, and HTTP abort propagation.

The remaining effects synchronize document title/main focus, notification timers, and catalog/detail request lifetime. There are no derived-value or user-action effects. Admin confirmations use stable mount refs, so their focus behavior does not require effects.

For checkout, open `/checkout` with an empty cart, then add an item and follow **Continue to checkout**. Submit blank/invalid/oversized fields and confirm inline errors, first-error focus, retained values and unchanged cart. Correct errors, leave optional fields blank, submit once, and confirm the focused success message and header count zero. Refresh and revisit checkout to confirm an empty cart and discarded delivery details. Exercise back/edit-cart navigation, repeated submit attempts, blocked storage, narrow/wide layouts, and unchanged storefront styles after visiting checkout. Focused tests cover schema normalization, required/optional fields, international text/postal codes, length limits, malformed email, the actual Zod resolver, and checkout route matching.

Also check toast dismissal, six-second timing, hover/focus pause, persistent errors, repeated/rapid actions, cart limit and storage-error feedback, View cart navigation, and reduced-motion/mobile layouts.

For product details, follow a product title, open `/products/1` directly, refresh it, and use browser back/forward. Check an unavailable product, an unknown numeric ID, and malformed IDs. Confirm loading and retry behavior, add to cart and follow the toast action, and check narrow/wide layouts. Changing product routes during a slow request must not display the previous product's response.

Check card navigation from the artwork, metadata, title, and price. The cart button must add without navigating; keyboard focus and reduced-motion settings must remain usable. Post a demo comment, refresh, switch products, and return to confirm per-product persistence. Check blank/overlong fields, empty comments, multiline text, corrupt saved data, and unavailable browser storage.

In React DevTools **Components**, expand `App`, `CartProvider`, the active `RetryablePage`, and each local `RequestBoundary`, then compare the active branches and props above. Inspect the shared query observers, App's demo/session/toast hooks, the single cart owner, Checkout's useForm owner and field subscriptions, ProductCatalog's filters, admin editor state during list loading/retry, and each Toast's hover/focus flags.
