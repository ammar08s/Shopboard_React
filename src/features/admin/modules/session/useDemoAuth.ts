import { useState } from 'react';
import { matchesDemoCredentials, readDemoSession, saveDemoSession } from './admin.session.ts';

interface DemoAuth {
  signedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

/** Owns the simulated tab-scoped admin session. No inputs.
 * @returns Current sign-in state, a credential check, and logout.
 */
export function useDemoAuth(): DemoAuth {
  const [signedIn, setSignedIn] = useState(readDemoSession);

  /** Signs in only when the public demo credentials match.
   * @param email - Submitted email.
   * @param password - Submitted password.
   * @returns Whether login succeeded; updates React state and sessionStorage on success.
   */
  function login(email: string, password: string): boolean {
    if (!matchesDemoCredentials(email, password)) return false;
    saveDemoSession(true);
    setSignedIn(true);
    return true;
  }

  /** Ends the simulated session. No inputs.
   * @returns Nothing; clears React state and the stored session.
   */
  function logout(): void {
    saveDemoSession(false);
    setSignedIn(false);
  }

  return { signedIn, login, logout };
}
