# ShopBoard Project Rules

These instructions apply throughout this repository. Keep this document updated when project conventions change.

`AGENTS.md` is the authoritative engineering rules file. Keep `CLAUDE.md` byte-for-byte identical whenever these rules change.

## Scope and stack

- Build ShopBoard with React and TypeScript using the existing Vite setup.
- This repository contains the frontend. Access the backend through API clients; do not add backend code here.
- Use plain CSS for now. Keep the styling approach replaceable.
- Keep product requirements, user flows, and backend contracts in `design.md`. This file defines engineering and agent working rules.

## Feature-based architecture

- Organize code around features, not project-wide technical categories.
- **Each feature separates UI into `components/` and non-UI code into `modules/`. Each component owns a folder containing its component, styles, and UI tests when needed. Modules group state/hooks, business logic, API access, validation, types, and tests by responsibility. Components may import modules; modules must never import components. Split by responsibility, without empty folders or trivial wrapper components.**
- Use `components/<ComponentName>/<ComponentName>.tsx` for feature entry points and small component collections. When a feature's UI grows, group related component folders by responsibility using `components/<responsibility>/<ComponentName>/<ComponentName>.tsx`, such as `catalog/`, `filtering/`, `loading/`, and `feedback/`. Colocate each component's CSS in its own folder. Keep exactly one component per file.
- Use descriptive responsibility folders such as `modules/catalog/`, `modules/filtering/`, and `modules/pricing/`; do not recreate a flat collection of unrelated logic files inside `modules/`.
- Keep module tests beside the code they exercise. Name hooks with a `use` prefix, such as `useProducts.ts` or `useProductFilters.ts`.
- Keep feature-specific types with the module that owns their domain. UI-only types belong with their component.
- Keep only genuinely shared feature UI rules in clearly named stylesheets under the narrowest owning `components/` group, such as `components/loading/productSkeleton.css`; component-specific selectors and responsive rules belong beside their component.
- Do not create empty files, folders, barrel files, or abstractions to satisfy the structure. Create only the parts a feature actually needs.
- Use `src/app/` for application setup, composition, providers, and coordination between features.
- Put the root component at `src/app/App.tsx` and application UI in `src/app/components/<ComponentName>/`, with colocated styles. Keep `src/main.tsx` focused on bootstrapping.
- Use `src/shared/` for reusable, feature-independent code and styles. Do not create one large shared file.
- Features may import shared code. Shared code must never import feature or application code.
- Features must not import directly from other features. Coordinate them through the application layer and explicit props or callbacks.
- Extract code into shared only when it has a clear reusable responsibility; avoid speculative reuse.

Illustrative structure; create only the parts actually needed:

```text
src/
  app/
    App.tsx
    App.css
    components/
      StoreHeader/
        StoreHeader.tsx
        StoreHeader.css
  features/
    products/
      components/
        Products/
          Products.tsx
        catalog/
          ProductCatalog/
            ProductCatalog.tsx
            ProductCatalog.css
          ProductCard/
            ProductCard.tsx
            ProductCard.css
        filtering/
          ProductFilters/
            ProductFilters.tsx
            ProductFilters.css
        loading/
          ProductLoading/
            ProductLoading.tsx
            ProductLoading.css
          productSkeleton.css
      modules/
        catalog/
          products.api.ts
          products.data.ts
          products.data.test.ts
          products.types.ts
          useProducts.ts
        filtering/
          products.filters.ts
          products.filters.test.ts
          products.filters.types.ts
          useProductFilters.ts
  shared/
    api/
      apiClient.ts
    styles/
      global.css
      typography.css
  main.tsx
```

`modules/catalog/products.api.ts` is the products feature's data access file. Its response validation, domain model, and request hook belong in the same catalog module. Filtering and pricing have their own focused modules. Import files directly rather than through re-export barrels.

## Clean code

- Give every function one clear responsibility. Split functions when they combine unrelated jobs.
- Prefer descriptive names, small modules, guard clauses, and straightforward control flow.
- Keep business rules separate from rendering and HTTP details.
- Prefer composition over large configurable components or unnecessary inheritance.
- Avoid duplicated business rules, magic values, deeply nested conditions, and premature abstractions.
- Do not enforce arbitrary line limits; split code when responsibilities or readability require it.
- Remove unused code and imports. Do not leave commented-out implementations.

## Function documentation

- Every function must have a documentation comment immediately above it explaining its purpose, inputs, and output.
- Use JSDoc with `@param` for each parameter and `@returns` for the result.
- Explicitly state when there are no inputs or no returned value.
- Document side effects and meaningful error behavior when applicable.
- This rule includes components, hooks, helpers, handlers, and anonymous callbacks. Prefer named functions when that makes documentation clearer.
- Keep comments accurate when behavior changes; explain the contract rather than narrating each implementation line.

```ts
/**
 * Filters products by their names.
 * @param products - Products to search.
 * @param query - Search text to match against product names.
 * @returns Products whose names contain the search text.
 */
function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  /**
   * Checks whether a product matches the normalized query.
   * @param product - Product to check.
   * @returns Whether the product name contains the query.
   */
  function matchesQuery(product: Product): boolean {
    return product.name.toLowerCase().includes(normalizedQuery);
  }

  return products.filter(matchesQuery);
}
```

## TypeScript

- Enable and preserve TypeScript strict mode.
- Do not use `any`, type assertions (`as` or angle-bracket assertions), or non-null assertions (`value!`) unless there is a documented reason immediately beside the usage.
- Exceptions must explain why narrowing, validation, or a better type cannot reasonably solve the problem. Do not use assertions merely to silence errors.
- `as const` falls under the assertion rule. Logical negation (`!condition`) is allowed. Import aliases (`import { name as alias }`) are unrelated to type assertions.
- Prefer explicit null checks, discriminated unions, type guards, and accurate domain types.
- Treat untrusted external data as `unknown` and validate it before using it as application data. A generic request return type alone does not validate a response.
- Explicitly type component props and API function inputs and outputs. Infer obvious local types.
- Use type-only imports where appropriate. Do not bypass compiler checks with suppression comments without a documented reason.

## React and state

- Keep exactly one React component per file. Each component must declare a typed `Props` interface; components without configurable props may use `interface Props { children?: never }`.
- Apply the repository skills at `.agents/skills/vercel-composition-patterns/SKILL.md` and `.agents/skills/vercel-react-best-practices/SKILL.md` when writing or reviewing React code; use rules applicable to this Vite client application.
- Apply `code-simplifier` to touched code during implementation and final review, preserving behavior and the required function documentation.

- Use function components and follow the Rules of Hooks.
- Use React Router for route composition, route parameters, and internal navigation. Keep application routes in `src/app/` and route-specific UI and data access in the owning feature.
- Keep rendering pure. Perform user-triggered work in event handlers and use effects for synchronization with external systems.
- Start with React's built-in state tools. Add a state library only when a concrete need justifies it.
- Keep state close to where it is used. Lift it only when consumers need to share it.
- Derive values from existing state instead of storing duplicate state.
- Never mutate React state directly. Use stable identifiers for list keys.
- Extract custom hooks when stateful behavior has a clear independent responsibility; do not add hooks solely to wrap a single trivial expression.

## API client and data access

- Centralize base URL configuration, request execution, HTTP error handling, and response parsing in `shared/api/apiClient.ts`.
- Put feature endpoints in the owning module's API file, such as `features/products/modules/catalog/products.api.ts`, using the shared client.
- UI components must not call `fetch` directly or contain endpoint URLs.
- Expose clearly named operations such as `getProducts`, `createProduct`, `updateProduct`, and `deleteProduct`, with typed inputs and outputs.
- Validate response data at the data boundary and map backend models to frontend models when necessary.
- Keep HTTP concerns in the client and business rules in feature logic.
- Handle failed requests explicitly. Provide appropriate loading, error, empty, and success states in the UI.
- Prevent duplicate submissions while mutations are pending and handle stale or cancelled requests when relevant.
- Read deployment-specific configuration from environment variables. Never put secrets in frontend code or frontend environment variables.
- Keep mock data behind the same feature data interface when mocks are needed.
- Frontend admin controls do not provide authorization; the backend must enforce permissions.

## CSS and accessibility

- Keep feature CSS beside the UI it styles.
- Use mobile-first responsive CSS
- Use descriptive, feature-prefixed class names to reduce collisions with plain CSS.
- Keep global resets, base typography, and reusable design variables in `shared/styles/`.
- Use CSS variables for repeated design values such as colors and spacing.
- Avoid business logic that depends on CSS class names or styling implementation details.
- Use semantic HTML, accessible form labels, keyboard-operable controls, and visible focus styles.
- Build layouts that remain usable on small and large screens.

## Dependencies and working practices

- Inspect existing code and conventions before making changes.
- Prefer existing tools and native platform capabilities. Justify new dependencies with a concrete need and avoid adding libraries speculatively.
- Keep changes focused on the requested task. Preserve unrelated user changes.
- Keep only requested application code, tests, configuration, skills, and durable project documentation in this repository. Do not add AI chat transcripts, implementation plans, agent progress/review logs, scratch files, or temporary verification assets; keep working artifacts outside the repository. Product requirements belong in `design.md`, setup and usage in `README.md`, and engineering rules here.
- Keep naming consistent: PascalCase for components and component files; camelCase for functions and variables; `use` prefixes for hooks; descriptive feature filenames such as `products.api.ts`.
- Use the existing Oxlint and Prettier configurations.
- Run `npm run format` to apply project formatting and `npm run format:check` to check it without changing files. Keep LF text line endings as defined in `.gitattributes`.
- Keep complete project-scoped Codex skills in `.agents/skills/`, including their referenced rule files. Preserve third-party skill contents and exclude them from application formatting and linting.
- Keep the Husky pre-commit hook active through the `prepare` script. Its `lint-staged.config.mjs` tasks check staged TypeScript with Oxlint, supported staged files with Prettier, and the full project with `npm run typecheck` before restoring unstaged edits to partially staged files. Fix failures before committing.
- Update relevant documentation when architecture, setup, or behavior changes.
- Keep the README component tree rooted at `App` synchronized with every component file, its props, conditional rendering, and state ownership. Verify it in React DevTools' Components tab when browser access is available; report any access limitation explicitly.
- Discuss significant architecture changes or unclear product requirements before implementing them. Routine decisions within these rules can proceed.

## Validation and completion

- For code changes, run `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` before reporting completion.
- Add focused behavior tests for meaningful business logic and bug fixes when test tooling is available. Do not introduce a testing framework without a concrete need.
- Manually check affected UI behavior, responsive layouts, and relevant loading, error, empty, and success states when the application can be run.
- Documentation-only changes require checking the resulting document, not running application tests.
- Report what changed, what was verified, and any remaining limitations. Never claim a check passed unless it was actually run successfully.
