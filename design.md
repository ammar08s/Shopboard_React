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
Admin mutations, authentication, cart, checkout, and detail pages are outside this first increment because write endpoints are not documented.

## Approaches

Selected: real API catalog first. This establishes a reliable data boundary and functioning browsing experience.
Deferred: catalog with local admin mutations, which would suggest persistence the API does not provide.

## Validation

Use Node's built-in test runner for filtering and response validation. Run lint and production build. Check browser behavior when browser tools are available.
