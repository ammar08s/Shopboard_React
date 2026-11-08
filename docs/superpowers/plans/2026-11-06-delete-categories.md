# Delete categories implementation plan

**Goal:** Let admins remove an accidental category while preserving its products and saved local edits.

**Architecture:** Categories remain derived from products. CategoryManager owns the deletion confirmation and destination field. AdminDashboard sends the validated action through App to an atomic product-category reassignment in useDemoCatalog; existing catalog persistence stores the result. No new dependency, endpoint, or storage schema.

**Spec:** design.md, demo administration and cart.

## Tasks

- [x] Test normalized deletion/destination validation, product counts, bulk reassignment without mutation, preserved local edits/deleted products, and persistence after refresh.
- [x] Add an accessible CategoryManager listing categories with Delete controls, affected count, required replacement selection/name, confirmation and cancellation. Provide Uncategorized as a suggested replacement; permit another name when deleting the last category.
- [x] Integrate through AdminDashboard and App; reconcile an open product editor without discarding other entered fields. Update the README component tree, props and state ownership.
- [x] Apply React/composition and code-simplifier guidance. All 27 tests, lint, build, formatting and render checks pass. Browser/DevTools access remains unavailable; live interaction and responsive visual checks remain unverified.

All category deletion changes are browser-local. Products and cart snapshots are preserved. No commits or branch changes are requested.

## Review record

An independent read-only review found a stale editor-category selection that could revive when a deleted name was reused. Fixed it by lifting the controlled editor category into AdminDashboard and updating it during deletion. The focused regression was observed failing before the fix and then passing; the full suite passes. Category deletion waits for the full API collection so partial data cannot leave products behind. Render checks cover category list/empty/disabled states, controlled editor replacement, dashboard wiring, and all 22 README component paths.
