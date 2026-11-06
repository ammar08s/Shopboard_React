# Initial ShopBoard catalog

Build a responsive, read-only storefront backed by https://shopboard-api.vercel.app/api/products.
Users can search names, filter category and stock availability, sort names or prices, and reset filters.
Show loading, retryable errors, empty API results, and no matching results distinctly.
While loading, show a CSS skeleton matching the filter sidebar, sorting toolbar, and six product cards. Use two card columns on small screens and three on wide screens. Keep placeholders decorative and non-interactive, announce loading once for assistive technology, and disable the shimmer for reduced-motion preferences. Replace the skeleton immediately when the request succeeds or fails; do not add an artificial loading delay or new dependency.
Use warm neutral CSS, a green accent, a compact header, an editorial introduction, filter sidebar, and responsive product grid.
The API supplies no images or currency code. Use decorative category initials and label prices as USD as an explicit initial display assumption.
Validate unknown API responses and map snake_case fields into frontend models. Cancel requests on unmount.
Keep components in separate files with typed Props interfaces, including components without configurable props.
Use React state, derive filtered results during rendering, and avoid new runtime dependencies.
The initial catalog is extended with a browser-only admin demo and shopping cart. Checkout and detail pages remain outside scope.

## Demo administration and cart

- Keep React, TypeScript, Vite, plain CSS, and the existing feature boundaries. Coordinate features through `App` and explicit props, without another runtime dependency.
- Navigation uses hash links for the collection, cart, and admin login/dashboard so refresh and browser history work on static hosting.
- Show demo credentials on the login page: `admin@shopboard.demo` / `Admin123!`. Reject invalid credentials; keep the demo session in sessionStorage and provide logout. This is a simulated UI gate, not real authentication or authorization.
- Admins can read, create, edit, and delete products. Validate trimmed titles/categories and nonnegative USD prices with at most two decimal places; allow stock changes and confirm deletion. Show actionable errors and success feedback.
- The product form offers a dropdown of existing categories, derived from the current collection. "Create new category" opens a required name field and "Use existing category" cancels it. New categories are saved with the product and become available in subsequent dropdowns and storefront filters. Reuse existing category spelling when a newly entered name differs only by capitalization or surrounding spaces. Category names remain 1–60 trimmed characters; categories without products are not stored separately.
- Persist local catalog changes in versioned localStorage and merge them with the read-only API catalog. The same changes appear in the storefront and survive refresh. Never send write requests to the external API. Demo-created products use negative IDs to avoid colliding with API IDs. Keep loading, retryable API errors, and empty feedback.
- Products expose add-to-cart actions for available items. The cart shows saved product snapshots, quantities, removal, clear, line totals, and the USD total. Repeated additions increase quantity. Persist validated cart data in versioned localStorage. Explain that checkout is outside this demo.
- A saved cart is independent of later demo catalog edits: existing items retain their saved price/title/stock snapshot until removed or added again. This is a local shopping demo, without live inventory reservations.
- Recover from corrupt/unavailable browser storage without crashing; tell users when changes cannot survive refresh. No cross-device persistence is promised.

### Extension approach

Use a local changes layer over API data, keeping the shared API client read-only. This preserves API loading/error behavior and keeps demo changes visible across both admin and storefront. Writing to undocumented endpoints would not provide reliable persistence; replacing the live catalog with static mocks would discard existing browsing behavior. The implementer's choice is a local changes layer with a tab-scoped demo session and a separate persistent cart.

## Approaches

Selected: real API catalog first. This establishes a reliable data boundary and functioning browsing experience.
Deferred: catalog with local admin mutations, which would suggest persistence the API does not provide.

## Validation

Use Node's built-in test runner for filtering and response validation. Run lint and production build. Check browser behavior when browser tools are available.
