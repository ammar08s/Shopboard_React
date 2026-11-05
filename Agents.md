# ShopBoard Project Rules

These instructions apply throughout this repository. Keep this document updated when project conventions change.

## Scope and stack

- Build ShopBoard with React and TypeScript using the existing Vite setup.
- This repository contains the frontend. Access the backend through API clients; do not add backend code here.
- Use plain CSS for now. Keep the styling approach replaceable.
- Keep product requirements, user flows, and backend contracts in `design.md`. This file defines engineering and agent working rules.

## Feature-based architecture

- Organize code around features, not project-wide technical categories.
- Separate a feature's UI, state, business logic, and data access when those responsibilities exist.
- Start with focused files. Introduce subfolders when size or complexity makes them useful.
- Do not create empty files, folders, or abstractions to satisfy a template. A simple feature may need only a UI file.
- Keep feature-specific types, styles, and tests with that feature.
- Use `src/app/` for application setup, composition, providers, and coordination between features.
- Use `src/shared/` for reusable, feature-independent code and styles. Do not create one large shared file.
- Features may import shared code. Shared code must never import feature or application code.
- Features must not import directly from other features. Coordinate them through the application layer and explicit props or callbacks.
- Extract code into shared only when it has a clear reusable responsibility; avoid speculative reuse.

Illustrative structure; create only the parts actually needed:

```text
src/
  app/
    App.tsx
  features/
    products/
      Products.tsx
      products.css
      products.state.ts
      products.logic.ts
      products.api.ts
      products.types.ts
  shared/
    api/
      apiClient.ts
    ui/
    styles/
  main.tsx
```

`products.api.ts` is the feature's data access file. Other data files, such as fixtures or mapping utilities, belong beside it when needed.

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
- Apply `vercel-composition-patterns` and `vercel-react-best-practices` when writing or reviewing React code; use rules applicable to this Vite client application.
- Apply `code-simplifier` to touched code during implementation and final review, preserving behavior and the required function documentation.

- Use function components and follow the Rules of Hooks.
- Keep rendering pure. Perform user-triggered work in event handlers and use effects for synchronization with external systems.
- Start with React's built-in state tools. Add a state library only when a concrete need justifies it.
- Keep state close to where it is used. Lift it only when consumers need to share it.
- Derive values from existing state instead of storing duplicate state.
- Never mutate React state directly. Use stable identifiers for list keys.
- Extract custom hooks when stateful behavior has a clear independent responsibility; do not add hooks solely to wrap a single trivial expression.

## API client and data access

- Centralize base URL configuration, request execution, HTTP error handling, and response parsing in `shared/api/apiClient.ts`.
- Put feature endpoints in feature API files such as `products.api.ts`, using the shared client.
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
- Keep naming consistent: PascalCase for components and component files; camelCase for functions and variables; `use` prefixes for hooks; descriptive feature filenames such as `products.api.ts`.
- Use the existing Oxlint and Prettier configurations.
- Update relevant documentation when architecture, setup, or behavior changes.
- Keep the README component tree rooted at `App` synchronized with every component file, its props, conditional rendering, and state ownership. Verify it in React DevTools' Components tab when browser access is available; report any access limitation explicitly.
- Discuss significant architecture changes or unclear product requirements before implementing them. Routine decisions within these rules can proceed.

## Validation and completion

- For code changes, run `npm run lint` and `npm run build` before reporting completion.
- Add focused behavior tests for meaningful business logic and bug fixes when test tooling is available. Do not introduce a testing framework without a concrete need.
- Manually check affected UI behavior, responsive layouts, and relevant loading, error, empty, and success states when the application can be run.
- Documentation-only changes require checking the resulting document, not running application tests.
- Report what changed, what was verified, and any remaining limitations. Never claim a check passed unless it was actually run successfully.
