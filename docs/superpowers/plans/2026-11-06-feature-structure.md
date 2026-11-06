# Feature Structure Implementation Plan

> Implement directly in the current workspace using superpowers:executing-plans. The user approved the structure and requested implementation.

**Goal:** Make feature UI and logic easy to locate without changing storefront behavior.
**Architecture:** Feature components own folders and styles under `components/`; non-UI code is grouped by responsibility under `modules/`. Application composition lives in `src/app/`, with header, introduction, and footer components beside their styles.
**Tech Stack:** Existing React, strict TypeScript, Vite, plain CSS, Node test runner, Oxlint, and Prettier. No new dependencies.
**Spec:** User-approved structure in the conversation; engineering rules in `AGENTS.md`; product behavior in `design.md`.

## Global constraints

- Preserve API validation, cancellation, retry, search, category/stock filters, sorting, reset, responsive layout, and UI copy.
- Document every function; retain typed Props interfaces and one component per file.
- Components may import modules; modules must never import components. Features communicate through the application layer.
- Keep shared code independent of features and application code. Do not add empty directories, barrel files, or trivial wrapper components.

## Tasks

- [x] Move catalog API, validation, model, and request hook into `modules/catalog/`; separate existing validation tests beside the validator.
- [x] Move selection rules and filter types into `modules/filtering/`; extract `useProductFilters(products)` and pure category/sort helpers. Place selection tests beside the logic. Move `formatPrice(cents)` into `modules/pricing/`.
- [x] Move every product component into `components/<ComponentName>/`; extract `ProductToolbar`, `ProductLoading`, `ProductError`, and `ProductEmptyState`. Colocate CSS and preserve breakpoint rules. Keep truly shared feedback styling in a clearly named feature UI stylesheet.
- [x] Move `App` into `src/app/`; move `StoreHeader` into its component folder; extract `StoreIntro` and `StoreFooter` with their CSS; update `main.tsx`.
- [x] Replace the obsolete flat-feature rule and example in `AGENTS.md` with the agreed convention. Rewrite the README structure, complete component tree, branches, props, and state ownership.
- [x] Discover all module tests through the npm test script. Run tests, lint, Prettier checks, and build; inspect browser/DevTools when accessible; request a read-only final code review and address material findings.

## Interfaces

- Catalog: `Product`, `getProducts(signal: AbortSignal): Promise<Product[]>`, `parseProducts(payload: unknown): Product[]`, `useProducts(): { state: CatalogState; retry: () => void }`.
- Filtering: `ProductFilters`, `SortOrder`, `selectProducts(products, filters): Product[]`, `getProductCategories(products): string[]`, `updateProductSort(filters, value): ProductFilters`, and `useProductFilters(products)` returning filters, categories, visibleProducts, setFilters, resetFilters, and changeSort.
- Toolbar: matched/total counts, current sort, and `onSortChange(value: string): void`. Empty state: total product count and reset callback. Error: message and retry callback.

## Review focus

- Reorganized tests must remain discoverable and run on the existing Node version.
- Search normalization, combined filters, all sort modes, reset defaults, and source immutability must remain covered.
- Loading, retryable errors, empty API results, and searches with no matches must retain distinct feedback.
- Moving CSS must preserve media queries and avoid application imports of feature styling.
- README must include every component and accurately identify hooks' owning components and conditional branches.

## Execution record

The workspace was clean before implementation. This is a behavior-preserving refactor: retain existing behavior coverage and add focused cases for extracted category/sort rules; no new testing framework or snapshot tests.

Completed validation: eight module tests pass, including category and sort tests first observed failing before helper extraction; Oxlint and production build pass; Prettier and git diff --check pass. Static checks confirm all 13 component paths, Props interfaces, function documentation, and module/UI boundaries. All moved CSS declarations and breakpoint conditions match the original styles. Local Vite HTTP and server-render smoke checks pass for loaded, loading, retryable-error, empty-catalog, and no-match markup. Browser/React DevTools and manual responsive interaction checks are unavailable because neither the browser host nor native computer-use connection is accessible. Independent read-only review found no concrete issues; it checked tracked deletions and untracked additions against HEAD, the engineering rules, and this plan. No review fixes were required.
