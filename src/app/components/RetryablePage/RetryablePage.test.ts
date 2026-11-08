import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import type { Root } from 'react-dom/client';
import type AppComponent from '../../App.tsx';
import type { TestContext } from 'node:test';
import type { RetryablePage as PageComponent } from './RetryablePage.tsx';
import type { RequestBoundary as BoundaryComponent } from '../../../shared/components/RequestBoundary/RequestBoundary.tsx';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true });
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const { act, createElement, StrictMode } = await import('react');
const { MemoryRouter } = await import('react-router');
const { createRoot } = await import('react-dom/client');
const { QueryClient, QueryClientProvider, useSuspenseQuery } =
  await import('@tanstack/react-query');
let server: ViteDevServer;
let request: () => Promise<string> = successfulRequest;

interface Props {
  children?: never;
}

/** Supplies successful query content for tests that focus on module loading. No inputs.
 * @returns An already resolved feature result.
 */
function successfulRequest(): Promise<string> {
  return Promise.resolve('Loaded feature');
}

/** Exercises the actual suspense query hook in the boundary under test.
 * @param props - No configurable inputs.
 * @returns Loaded feature content; suspends or throws while the test request is pending or failed.
 */
function TestFeature(_props: Props): ReactElement {
  const { data } = useSuspenseQuery({
    queryKey: ['boundary-test'],
    queryFn: request,
    retry: false,
  });
  return createElement('p', null, data);
}

/** Starts Vite's in-memory TSX compiler without opening a browser or listening for HTTP. No inputs.
 * @returns A promise resolving when source components can be loaded by the existing Node runner.
 */
async function setupCompiler(): Promise<void> {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });
}
before(setupCompiler);

/** Releases the compiler and DOM resources. No inputs.
 * @returns A promise resolving after all test-only resources close.
 */
async function teardownCompiler(): Promise<void> {
  await server.close();
  dom.window.close();
}
after(teardownCompiler);

/** Narrows the compiled, repository-owned page module without asserting its type.
 * @param value - Untyped Vite module result.
 * @returns Whether the expected component export is present.
 */
function isPageModule(value: unknown): value is { RetryablePage: typeof PageComponent } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'RetryablePage' in value &&
    typeof value.RetryablePage === 'function'
  );
}

/** Narrows the compiled, repository-owned request boundary module.
 * @param value - Untyped Vite module result.
 * @returns Whether its expected component export is present.
 */
function isBoundaryModule(value: unknown): value is { RequestBoundary: typeof BoundaryComponent } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'RequestBoundary' in value &&
    typeof value.RequestBoundary === 'function'
  );
}

/** Renders an actual component tree with a fresh query cache and a persistent neighboring field.
 * @param content - Boundary and feature to exercise.
 * @returns The mounted root, query cache, and test container.
 */
async function mount(
  content: ReactNode,
): Promise<{ root: Root; client: InstanceType<typeof QueryClient>; container: HTMLDivElement }> {
  const container = document.createElement('div');
  document.body.append(container);
  /** Handles expected boundary-caught fixture errors without printing React's development report.
   * @param error - Expected fixture error caught by the component boundary.
   * @returns Nothing; assertions observe the resulting recovery UI instead.
   */
  function caught(_error: unknown): void {}
  const root = createRoot(container, { onCaughtError: caught });
  const client = new QueryClient();
  /** Commits the test tree and its initial asynchronous work. No inputs.
   * @returns A promise resolving after React has flushed the render.
   */
  async function render(): Promise<void> {
    root.render(
      createElement(
        'div',
        null,
        createElement('input', { 'aria-label': 'Persistent editor', defaultValue: 'Unsent draft' }),
        createElement(QueryClientProvider, { client }, content),
      ),
    );
  }
  await act(render);
  return { root, client, container };
}

/** Waits for asynchronous UI changes using bounded condition checks.
 * @param predicate - Observable DOM condition.
 * @returns A promise resolving when the condition holds; fails if it does not settle promptly.
 */
async function waitFor(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    /** Flushes request callbacks and React work before checking again. No inputs.
     * @returns A promise resolving after one event-loop turn.
     */
    async function flush(): Promise<void> {
      /** Allows scheduled callbacks to run.
       * @param resolve - Completion callback for this event-loop turn.
       * @returns Nothing; schedules the callback immediately.
       */
      function tick(resolve: () => void): void {
        setTimeout(resolve, 0);
      }
      await new Promise<void>(tick);
    }
    await act(flush);
  }
  assert.fail(`The expected boundary UI did not appear: ${document.body.textContent}`);
}

/** Confirms the neighboring form control was neither replaced nor reset.
 * @param container - Mounted test tree.
 * @param editor - Original field instance.
 * @returns Nothing; asserts the same live field and draft remain present.
 */
function preservesEditor(container: HTMLDivElement, editor: HTMLInputElement): void {
  assert.equal(container.querySelector('input'), editor);
  assert.equal(editor.value, 'Unsent draft');
}

/** Checks a pending request is local and its explicit retry starts another real query attempt. No inputs.
 * @returns A promise resolving after loading, error, and recovery are observed.
 */
async function isolatesAndRetriesRequests(): Promise<void> {
  const loaded: unknown = await server.ssrLoadModule(
    '/src/shared/components/RequestBoundary/RequestBoundary.tsx',
  );
  assert.ok(isBoundaryModule(loaded));
  let rejectRequest: (error: Error) => void = ignoredRejection;
  /** Placeholder replaced synchronously by the promise executor.
   * @param error - Unused error until the executor installs the real rejection callback.
   * @returns Nothing.
   */
  function ignoredRejection(_error: Error): void {}
  /** Captures rejection for a genuinely pending first request.
   * @param resolve - Unused success callback.
   * @param reject - Rejection callback controlled by the test.
   * @returns Nothing; preserves the pending request until failure is triggered.
   */
  function pending(_resolve: (value: string) => void, reject: (error: Error) => void): void {
    rejectRequest = reject;
  }
  const pendingRequest = new Promise<string>(pending);
  let attempts = 0;
  /** Fails the first attempt and supplies content on explicit retry. No inputs.
   * @returns The controlled first request or successful recovery data.
   */
  function loadFeature(): Promise<string> {
    attempts += 1;
    return attempts === 1 ? pendingRequest : Promise.resolve('Recovered feature');
  }
  request = loadFeature;
  const mounted = await mount(
    createElement(loaded.RequestBoundary, {
      loading: createElement('p', { role: 'status' }, 'Loading section'),
      // The typed createElement API requires this mandatory child in props; Node's type stripping cannot parse JSX.
      // oxlint-disable-next-line react/no-children-prop
      children: createElement(TestFeature),
    }),
  );
  const editor = mounted.container.querySelector('input');
  assert.ok(editor instanceof dom.window.HTMLInputElement);
  try {
    assert.match(mounted.container.textContent ?? '', /Loading section/);
    preservesEditor(mounted.container, editor);
    /** Triggers the controlled backend failure. No inputs.
     * @returns A promise resolving after React observes the rejection.
     */
    async function failRequest(): Promise<void> {
      rejectRequest(new Error('Temporary request failure'));
    }
    await act(failRequest);
    /** Detects error recovery controls. No inputs. @returns Whether the retry button exists. */
    function failed(): boolean {
      return mounted.container.querySelector('button') !== null;
    }
    await waitFor(failed);
    preservesEditor(mounted.container, editor);
    /** Activates the actual fallback button. No inputs. @returns A promise resolving after the local boundary reset. */
    async function retry(): Promise<void> {
      mounted.container.querySelector('button')?.click();
      await Promise.resolve();
    }
    await act(retry);
    /** Detects the successful retry. No inputs. @returns Whether recovered content is visible. */
    function recovered(): boolean {
      return mounted.container.textContent?.includes('Recovered feature') === true;
    }
    await waitFor(recovered);
    assert.equal(attempts, 2);
    preservesEditor(mounted.container, editor);
  } finally {
    /** Unmounts the test tree. No inputs. @returns A promise resolving after subscriptions are cleaned up. */
    async function unmount(): Promise<void> {
      mounted.root.unmount();
      await Promise.resolve();
    }
    await act(unmount);
    mounted.client.clear();
    mounted.container.remove();
  }
}
test(
  'isolates pending and failed requests and retries without resetting neighboring form state',
  isolatesAndRetriesRequests,
);

/** Checks a failed dynamic import is retried instead of reusing React.lazy's cached rejection. No inputs.
 * @returns A promise resolving after import recovery is rendered without replacing the neighboring field.
 */
async function retriesPageImports(): Promise<void> {
  const loaded: unknown = await server.ssrLoadModule(
    '/src/app/components/RetryablePage/RetryablePage.tsx',
  );
  assert.ok(isPageModule(loaded));
  request = successfulRequest;
  let attempts = 0;
  /** Rejects one module download and makes the same loader succeed next time. No inputs.
   * @returns The feature module, or a simulated transient module download failure.
   */
  function load(): Promise<{ default: ComponentType<Props> }> {
    attempts += 1;
    return attempts === 1
      ? Promise.reject(new Error('Chunk offline'))
      : Promise.resolve({ default: TestFeature });
  }
  const mounted = await mount(createElement(loaded.RetryablePage, { load, pageProps: {} }));
  const editor = mounted.container.querySelector('input');
  assert.ok(editor instanceof dom.window.HTMLInputElement);
  try {
    /** Detects the module error fallback. No inputs. @returns Whether retry feedback is visible. */
    function failed(): boolean {
      return mounted.container.textContent?.includes('This page could not be displayed') === true;
    }
    await waitFor(failed);
    /** Activates the page's retry button. No inputs. @returns A promise resolving after a fresh lazy identity is created. */
    async function retry(): Promise<void> {
      mounted.container.querySelector('button')?.click();
      await Promise.resolve();
    }
    await act(retry);
    /** Detects the loaded module. No inputs. @returns Whether feature content is visible. */
    function recovered(): boolean {
      return mounted.container.textContent?.includes('Loaded feature') === true;
    }
    await waitFor(recovered);
    assert.equal(attempts, 2);
    preservesEditor(mounted.container, editor);
  } finally {
    /** Unmounts the test tree. No inputs. @returns A promise resolving after subscriptions are released. */
    async function unmount(): Promise<void> {
      mounted.root.unmount();
      await Promise.resolve();
    }
    await act(unmount);
    mounted.client.clear();
    mounted.container.remove();
  }
}
test('retries rejected page imports with a fresh lazy component identity', retriesPageImports);

/** Narrows the repository-owned application module compiled for this DOM test.
 * @param value - Untyped Vite module result.
 * @returns Whether the application component export is available.
 */
function isAppModule(value: unknown): value is { default: typeof AppComponent } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in value &&
    typeof value.default === 'function'
  );
}

/** Checks route-owned cancellation survives StrictMode and cannot take down the shell.
 * @param context - Test-scoped HTTP mock tracker.
 * @returns A promise resolving after a suspended detail request is cancelled by actual navigation.
 */
async function keepsShellDuringNavigation(context: TestContext): Promise<void> {
  const loaded: unknown = await server.ssrLoadModule('/src/app/App.tsx');
  assert.ok(isAppModule(loaded));
  const signals: AbortSignal[] = [];
  /** Holds detail requests and returns an empty collection on navigation.
   * @param input - Requested API URL.
   * @param options - HTTP request configuration.
   * @returns A controlled product request or valid empty catalog response.
   */
  function respond(input: string | URL | Request, options?: RequestInit): Promise<Response> {
    if (!String(input).endsWith('/1'))
      return Promise.resolve(Response.json({ items: [], total: 0 }));
    const signal = options?.signal;
    assert.ok(signal !== undefined && signal !== null);
    const activeSignal: AbortSignal = signal;
    signals.push(activeSignal);
    /** Holds the response until this route is left.
     * @param resolve - Unused success callback.
     * @param reject - Rejection callback for cancellation.
     * @returns Nothing; connects the response to its actual abort signal.
     */
    function pending(_resolve: (value: Response) => void, reject: (error: Error) => void): void {
      /** Rejects the simulated transport after an abort. No inputs.
       * @returns Nothing; reports the abort to the query cache.
       */
      function aborted(): void {
        reject(new DOMException('Aborted', 'AbortError'));
      }
      activeSignal.addEventListener('abort', aborted, { once: true });
    }
    return new Promise(pending);
  }
  context.mock.method(globalThis, 'fetch', respond);
  const mounted = await mount(
    createElement(
      StrictMode,
      null,
      createElement(
        MemoryRouter,
        { initialEntries: ['/products/1'] },
        createElement(loaded.default),
      ),
    ),
  );
  try {
    /** Detects the loaded route's local data fallback. No inputs.
     * @returns Whether a detail request is pending while its fallback is visible.
     */
    function waiting(): boolean {
      return (
        mounted.container.textContent?.includes('Loading product details') === true &&
        signals.length > 0
      );
    }
    await waitFor(waiting);
    const header = mounted.container.querySelector('header');
    assert.ok(header !== null);
    /** Chooses the real router link back to the collection.
     * @param link - Application link.
     * @returns Whether this is the collection navigation link.
     */
    function collectionLink(link: HTMLAnchorElement): boolean {
      return (
        link.getAttribute('href') === '/' && link.textContent?.includes('The collection') === true
      );
    }
    const link = [...mounted.container.querySelectorAll('a')].find(collectionLink);
    assert.ok(link !== undefined);
    const selectedLink: HTMLAnchorElement = link;
    /** Navigates through the application's real Link event handler. No inputs.
     * @returns A promise resolving after navigation updates are flushed.
     */
    async function navigate(): Promise<void> {
      selectedLink.click();
      await Promise.resolve();
    }
    await act(navigate);
    /** Detects a successful empty catalog rather than stale product loading. No inputs.
     * @returns Whether collection empty feedback has replaced the old detail page.
     */
    function emptyCatalog(): boolean {
      return mounted.container.textContent?.includes('The shelves are quiet.') === true;
    }
    await waitFor(emptyCatalog);
    assert.equal(mounted.container.querySelector('header'), header);
    /** Checks each abandoned detail transport was aborted.
     * @param signal - A detail request signal, including StrictMode replay attempts.
     * @returns Whether the transport was cancelled.
     */
    function wasAborted(signal: AbortSignal): boolean {
      return signal.aborted;
    }
    assert.ok(signals.every(wasAborted));
  } finally {
    /** Unmounts the application and lets cancellation callbacks settle. No inputs.
     * @returns A promise resolving after subscriptions and pending requests are removed.
     */
    async function unmount(): Promise<void> {
      mounted.root.unmount();
      await Promise.resolve();
    }
    await act(unmount);
    mounted.client.clear();
    mounted.container.remove();
  }
}
test(
  'keeps the shell mounted and cancels suspended requests during StrictMode route changes',
  keepsShellDuringNavigation,
);

/** Verifies actual admin fields and saved product controls remain available as the API list resolves.
 * @param context - Test-scoped HTTP mock tracker.
 * @returns A promise resolving after the same editor survives loading and successful data arrival.
 */
async function preservesAdminDraft(context: TestContext): Promise<void> {
  const loaded: unknown = await server.ssrLoadModule('/src/app/App.tsx');
  assert.ok(isAppModule(loaded));
  const previousSession = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: dom.window.sessionStorage,
    configurable: true,
  });
  dom.window.sessionStorage.setItem('shopboard.admin.session.v1', 'signed-in');
  dom.window.localStorage.setItem(
    'shopboard.catalog.v1',
    JSON.stringify({
      version: 1,
      products: [{ id: -1, title: 'Saved cup', category: 'Home', priceCents: 99, inStock: true }],
      deletedIds: [],
    }),
  );
  let resolveRequest: (response: Response) => void = ignoredResponse;
  /** Placeholder replaced synchronously by the controlled promise executor.
   * @param response - Unused response before initialization.
   * @returns Nothing.
   */
  function ignoredResponse(_response: Response): void {}
  /** Captures the successful API response callback.
   * @param resolve - Resolver controlled by the test.
   * @returns Nothing; holds the API request pending while the editor is used.
   */
  function pending(resolve: (response: Response) => void): void {
    resolveRequest = resolve;
  }
  const response = new Promise<Response>(pending);
  /** Supplies the controlled API request. No inputs.
   * @returns The pending catalog response.
   */
  function respond(): Promise<Response> {
    return response;
  }
  context.mock.method(globalThis, 'fetch', respond);
  const mounted = await mount(
    createElement(MemoryRouter, { initialEntries: ['/admin'] }, createElement(loaded.default)),
  );
  try {
    /** Detects a usable editor alongside the API list's loading feedback. No inputs.
     * @returns Whether the page is ready for an unsaved edit while the request remains pending.
     */
    function waiting(): boolean {
      return (
        mounted.container.querySelector('[name="title"]') !== null &&
        mounted.container.textContent?.includes('Loading the API collection') === true
      );
    }
    await waitFor(waiting);
    const editor = mounted.container.querySelector('[name="title"]');
    assert.ok(editor instanceof dom.window.HTMLInputElement);
    editor.value = 'Unsaved product draft';
    const panel = mounted.container.querySelector('[aria-label="Admin products"]');
    assert.ok(panel !== null);
    assert.match(panel.textContent ?? '', /Loading the API collection/);
    assert.match(panel.textContent ?? '', /Saved cup/);
    /** Completes the request without submitting or resetting the editor. No inputs.
     * @returns A promise resolving after the API result reaches the shared cache.
     */
    async function completeRequest(): Promise<void> {
      resolveRequest(
        Response.json({
          items: [
            { id: 1, title: 'API tote', category_name: 'Bags', price_cents: 1000, in_stock: true },
          ],
          total: 1,
        }),
      );
      await Promise.resolve();
    }
    await act(completeRequest);
    /** Detects the merged API and local list. No inputs.
     * @returns Whether loading has ended and the API product is present.
     */
    function loadedList(): boolean {
      return (
        mounted.container.textContent?.includes('API tote') === true &&
        !mounted.container.textContent.includes('Loading the API collection')
      );
    }
    await waitFor(loadedList);
    assert.equal(mounted.container.querySelector('[name="title"]'), editor);
    assert.equal(editor.value, 'Unsaved product draft');
    assert.equal(mounted.container.querySelector('[aria-label="Admin products"]'), panel);
    assert.match(panel.textContent ?? '', /Saved cup/);
  } finally {
    /** Removes React subscriptions after the admin scenario. No inputs.
     * @returns A promise resolving after pending work is flushed.
     */
    async function unmount(): Promise<void> {
      mounted.root.unmount();
      await Promise.resolve();
    }
    await act(unmount);
    mounted.client.clear();
    mounted.container.remove();
    dom.window.sessionStorage.clear();
    dom.window.localStorage.clear();
    if (previousSession === undefined) Reflect.deleteProperty(globalThis, 'sessionStorage');
    else Object.defineProperty(globalThis, 'sessionStorage', previousSession);
  }
}
test(
  'keeps the admin editor and saved product panel mounted while catalog data loads',
  preservesAdminDraft,
);
