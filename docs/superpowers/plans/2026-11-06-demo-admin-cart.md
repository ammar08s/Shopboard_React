# Demo admin and cart implementation plan

> **For agentic workers:** Apply executing-plans and verification-before-completion. The user requested a cart subagent; parent handles login/admin and application integration. Preserve the existing uncommitted component reorganization and work in the shared checkout.

**Goal:** Add a demo login, local product CRUD dashboard, and persistent cart.

**Architecture:** Products own API/domain/local catalog changes. Admin owns its independent form contract and UI. Cart owns snapshots, quantities, persistence, and cart UI. `App` owns navigation and composes the feature hooks and callbacks.

**Tech stack:** Existing React/TypeScript/Vite, plain CSS, Node test runner; no new dependencies.

**Spec:** [design.md](../../../design.md), demo administration and cart.

## Constraints and review focus

- Follow AGENTS.md, including documented functions, typed props, no assertions, direct imports, and feature boundaries.
- Validate saved unknown data, protect cent precision, reject blank fields and invalid prices.
- Keep API requests read-only; preserve loading, cancellation, retry, and empty UI.
- Test corrupt/blocked storage, repeated cart additions, out-of-stock additions, duplicate IDs, and edits after refresh.
- Keep the component tree, props, state ownership, and manual validation record in README current.

## Tasks

1. [x] Parent: write/run failing tests for demo credentials, form validation, catalog create/update/delete, and persistence; implement focused modules under admin/modules and products/modules/demo.
2. [x] Parent: implement Login, AdminDashboard, ProductEditor, and AdminProductList with accessible responsive CSS. Use explicit callbacks and deletion confirmation.
3. [x] Cart subagent: implement/test features/cart and add `onAddToCart: (product: Product) => void` through ProductCatalog, ProductGrid, ProductCard. Expose useCart actions and a controlled Cart component.
4. [x] Parent: lift catalog request ownership into App; pass request state, derived demo products, retry and add actions into Products. Add hash navigation, session state, header count and logout. Integrate Cart using the subagent's contract.
5. [x] Parent: simplify/review touched code; update README; run full tests, lint, build, formatting, and attempt browser checks. The browser host is unavailable and native Chrome access timed out; live CRUD/login/cart/responsive interaction and React DevTools checks remain unverified. Render-only checks cover loading/error/saved catalog data, cart empty/populated/storage-error states, login, editor, dashboard, and all 21 README component paths.

No commits or branch changes are requested.

## Review record

An independent read-only reviewer found no remaining Critical or Important issues. Fixed the skip-link navigation issue, changed cart acknowledgement to remain accurate at the quantity cap, and added long-word wrapping for valid demo product names/categories. Cross-tab synchronization and production authentication remain outside this demo. Existing component reorganization was preserved.
