# ShopBoard product requirements

Build a responsive, read-only storefront backed by https://shopboard-api.vercel.app/api/products.
Users can search names, filter category and stock availability, sort names or prices, and reset filters.
Show loading, retryable errors, empty API results, and no matching results distinctly.
While loading, show a CSS skeleton matching the filter sidebar, sorting toolbar, and six product cards. Use two card columns on small screens and three on wide screens. Keep placeholders decorative and non-interactive, announce loading once for assistive technology, and disable the shimmer for reduced-motion preferences. Replace the skeleton immediately when the request succeeds or fails; do not add an artificial loading delay or new dependency.
Use warm neutral CSS, a green accent, a compact header, an editorial introduction, filter sidebar, and responsive product grid.
The API supplies no images or currency code. Use decorative category initials and label prices as USD as an explicit initial display assumption.
Validate unknown API responses and map snake_case fields into frontend models. Cancel requests on unmount.
Keep components in separate files with typed Props interfaces, including components without configurable props.
Use React state and derive filtered results during rendering. Use React Router for client-side routes; add other runtime dependencies only when a requested feature requires them.
The storefront includes product details, a browser-only admin demo, and a shopping cart. Checkout remains outside scope.

## Product details and routing

- Use React Router with browser-history URLs: `/` for the collection, `/products/:productId` for a product, `/cart`, `/login`, and `/admin`. Unknown routes display a page-not-found message. Redirect signed-out admin visits to login and signed-in login visits to the dashboard.
- Make the full API-backed product card link to its detail route, while keeping Add to cart independently clickable and keyboard-operable. Show a clear hover and focus treatment, and suppress movement for reduced-motion preferences. Fetch the selected product directly from `GET /api/products/{id}` through the shared API client, without downloading the full collection on a direct detail-page visit.
- The single-product response contains `id`, `title`, `category_name`, `price_cents`, and `in_stock`. Validate unknown data, map it to the existing Product model, and reject responses with a different ID. The API supplies no product images or descriptions; display the existing decorative category treatment instead of inventing product information.
- Display the title, category, USD price, stock availability, and product ID. Available products can be added to the existing cart; disable that action for unavailable products. Keep a link back to the collection.
- Provide loading feedback, a retryable request/validation error, and a distinct not-found state for HTTP 404 or invalid IDs. Accept only canonical positive safe-integer IDs. Cancel requests when the route changes or unmounts so stale results cannot replace the current product.
- Details show the API record. Browser-only demo products use negative IDs and have no API detail route; their existing card and cart controls remain available.
- Preserve cart, demo session, and notifications during client-side navigation. Production hosting must serve `index.html` for application routes so direct links and refresh work.
- Load collection, product detail, cart, login, and dashboard UI with route-level dynamic imports on their first visit. Show page-loading feedback while a module downloads, cache loaded modules for later visits, and keep the shared shell and persistent state mounted outside that loading boundary. A failed module download must show an explicit reload action instead of removing the application.

## Demo product comments

- Show a comment section on each successfully loaded product page. Include an empty state, newest-first comments, display names, timestamps, and a form with labelled display-name and comment fields.
- Comments are a browser-only demo. Persist each product's comments in its own versioned localStorage entry; do not send comments to the API or imply that other users can see them.
- Trim submitted fields, require both values, limit display names to 60 characters and comment text to 1,000 characters, and render user text as plain text with its line breaks preserved.
- Reset the form after a successful submission and announce every post, including repeated submissions. Validate saved records and recover from corrupt data; if storage is blocked or full, keep new comments until the user leaves or refreshes the page and explain the persistence limitation.
- Mount the comment section with a product-ID key so comments and form feedback cannot carry over to another product.

## Demo administration and cart

- Keep React, TypeScript, Vite, React Router, plain CSS, and the existing feature boundaries. Coordinate features through the application layer and explicit props. Keep the cart in one application-level Context provider above the lazy route boundary; consumers read its state and call its actions through `useCart()`. Product route composition connects product UI to cart actions without direct imports between features. Context uses the existing React stack without another state dependency.
- Use router links for the collection, cart, login, dashboard, and notification actions so navigation preserves application state and browser history.
- Show demo credentials on the login page: `admin@shopboard.demo` / `Admin123!`. Reject invalid credentials; keep the demo session in sessionStorage and provide logout. This is a simulated UI gate, not real authentication or authorization.
- Admins can read, create, edit, and delete products. Validate trimmed titles/categories and nonnegative USD prices with at most two decimal places; allow stock changes and confirm deletion. Show actionable errors and success feedback.
- The product form offers a dropdown of existing categories, derived from the current collection. "Create new category" opens a required name field and "Use existing category" cancels it. New categories are saved with the product and become available in subsequent dropdowns and storefront filters. Reuse existing category spelling when a newly entered name differs only by capitalization or surrounding spaces. Category names remain 1–60 trimmed characters; categories without products are not stored separately.
- "Manage categories" lists categories with Delete controls. Deletion opens a confirmation showing the affected product count and requires a different replacement category. Choose an existing name or enter a new one, with Uncategorized suggested by default. Move all affected products in one local catalog update, preserve their IDs/details and prior edits, and remove the source category from dropdowns and storefront filters. Save the reassignment using the existing localStorage schema so it survives refresh. Cancellation changes nothing; existing cart snapshots stay independent. Require the API collection to be loaded before category deletion so partial catalog data cannot leave products behind. Deleting the last category is supported by entering a different replacement name.
- Persist local catalog changes in versioned localStorage and merge them with the read-only API catalog. The same changes appear in the storefront and survive refresh. Never send write requests to the external API. Demo-created products use negative IDs to avoid colliding with API IDs. Keep loading, retryable API errors, and empty feedback.
- Products expose add-to-cart actions for available items. The cart shows saved product snapshots, quantities, removal, clear, line totals, and the USD total. Repeated additions increase quantity. Persist validated cart data in versioned localStorage. Explain that checkout is outside this demo.
- A saved cart is independent of later demo catalog edits: existing items retain their saved price/title/stock snapshot until removed or added again. This is a local shopping demo, without live inventory reservations.
- Recover from corrupt/unavailable browser storage without crashing; tell users when changes cannot survive refresh. No cross-device persistence is promised.
- Use shared Toast and ToastRegion components for action feedback: cart add/quantity/remove/clear, quantity limits, demo login/logout, product/category mutations and form errors, cancellations, and collection retries. Keep persistent inline validation and request/storage feedback visible, but let the toast provide the action announcement. Display success/error/info variants, an accessible dismiss button, and an optional View cart link. Keep at most three notifications, replace repeated identical messages, dismiss success/info after six seconds, restart their timers after hover/focus ends, and keep errors until dismissed or displaced by newer notifications. Keep the queue mounted across navigation, respect reduced motion, wrap long content on mobile, and never steal keyboard focus. Use the existing React/CSS stack without a library.
- Keep polite/status and assertive/alert announcement regions mounted before the first notification arrives. Announce each newly published action, including identical repeated actions with distinct IDs; dismissal must not re-announce older messages. Render visible messages newest first to keep recent feedback in view on short screens.

## Validation

Use Node's built-in test runner for filtering and response validation. Run lint and production build. Check browser behavior when browser tools are available.
