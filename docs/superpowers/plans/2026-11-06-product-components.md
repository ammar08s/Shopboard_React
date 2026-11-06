# Product Component Organization Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the refactor, followed by the separate review subagent requested by the user.

**Goal:** Make the product UI easier to navigate by grouping its components by responsibility while preserving storefront behavior and appearance.

**Architecture:** Keep `components/Products/` as the feature entry point. Group the existing component folders under `catalog/`, `filtering/`, `loading/`, and `feedback/`. Keep individual component CSS colocated and group-shared CSS inside the group that owns it. Module responsibilities and application composition stay the same.

**Tech Stack:** Existing React, strict TypeScript, Vite, plain CSS, Oxlint, Prettier, and Node test runner; no added dependencies.

**Spec:** User request to organize product components, `AGENTS.md` engineering rules, and existing behavior in `design.md`.

## Global constraints

- Keep one component per file, typed Props interfaces, and required function documentation.
- Preserve component contracts, state ownership, UI copy, CSS declarations, and responsive breakpoints.
- Import files directly; do not add barrels, wrappers, contexts, or speculative shared code.
- Keep modules independent of components and features coordinated by the application layer.
- Work in the supplied checkout; this is a routine reorganization within the existing feature architecture.

## Task: Group product UI and synchronize its documentation

**Files:**

- Keep: `src/features/products/components/Products/Products.tsx`.
- Move into `components/catalog/`: `ProductCatalog/`, `ProductGrid/`, `ProductCard/`.
- Move into `components/filtering/`: `ProductFilters/`, `ProductToolbar/`.
- Move into `components/loading/`: `ProductLoading/`, `ProductCardSkeleton/`, `ProductFiltersSkeleton/`, `productSkeleton.css`.
- Move into `components/feedback/`: `ProductError/`, `ProductEmptyState/`, `productFeedback.css`.
- Update: moved component imports, entry-point imports, `AGENTS.md`, and README structure and component paths.

**Interfaces:** Component exports, Props types, callbacks, and module APIs remain unchanged.

- [x] Inspect existing responsibilities, imports, CSS, documentation, and clean working tree; run the baseline tests (8 pass).
- [ ] Move folders and shared styles, then update direct imports without changing rendered behavior.
- [ ] Update the engineering convention and full README tree, preserving props, conditional branches, and state ownership.
- [ ] Run existing tests, lint, build, formatting, path/structure checks, and available runtime checks. No new tests are needed for import-only changes.
- [ ] Request a separate read-only subagent review using `AGENTS.md`, `code-simplifier`, and `vercel-react-best-practices`; address material findings and report verified results and limitations.

## Review focus

- Imports must resolve after the extra directory level, including imports between groups.
- Feedback and skeleton CSS must still load in every relevant state.
- No React behavior, markup, style declarations, state ownership, or dependency changes should be introduced.
- Every component source path must appear accurately in the README tree.
- Check browser/React DevTools access and state any limitation explicitly.

## Execution record

Baseline: working tree clean; `npm.cmd test` passed all eight existing tests.
