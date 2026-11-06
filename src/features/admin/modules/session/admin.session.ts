export const DEMO_EMAIL = 'admin@shopboard.demo';
export const DEMO_PASSWORD = 'Admin123!';
const SESSION_KEY = 'shopboard.admin.session.v1';

/** Checks the public demo credentials; this is not backend authorization.
 * @param email - Submitted email, compared without casing or surrounding spaces.
 * @param password - Submitted password, compared exactly.
 * @returns Whether the demo credentials match.
 */
export function matchesDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

/** Reads the tab-scoped demo session, tolerating blocked storage. No inputs.
 * @returns Whether this tab previously signed in to the demo.
 */
export function readDemoSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'signed-in';
  } catch {
    return false;
  }
}

/** Saves or removes the simulated session; blocked storage leaves the in-memory session usable.
 * @param signedIn - Whether the user has signed in.
 * @returns Nothing; may write sessionStorage.
 */
export function saveDemoSession(signedIn: boolean): void {
  try {
    if (signedIn) sessionStorage.setItem(SESSION_KEY, 'signed-in');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // The demo still works for this page visit when session storage is unavailable.
  }
}
