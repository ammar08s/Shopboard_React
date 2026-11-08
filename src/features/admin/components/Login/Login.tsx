import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../../modules/session/admin.session.ts';
import './Login.css';

interface Props {
  onLogin: (email: string, password: string) => boolean;
}

/** Displays the essential demo sign-in form and public credentials.
 * @param props - Credential-checking callback supplied by the application.
 * @returns Accessible login form with invalid-credential feedback.
 */
export function Login({ onLogin }: Props): ReactElement {
  const [error, setError] = useState<string | null>(null);

  /** Checks submitted demo credentials and announces unsuccessful login.
   * @param event - Login form submission.
   * @returns Nothing; prevents navigation and calls the application's login action.
   */
  function submitLogin(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (!onLogin(String(values.get('email') ?? ''), String(values.get('password') ?? '')))
      setError('Email or password is incorrect. Use the demo credentials below.');
  }

  return (
    <section className="admin-login" aria-labelledby="admin-login-title">
      <span className="ui-eyebrow">A little behind the scenes</span>
      <h1 id="admin-login-title">
        Admin sign in<span>.</span>
      </h1>
      <p>Manage the collection in your own demo workspace.</p>
      <form
        onSubmit={submitLogin}
        className="admin-login-form"
        aria-describedby={error === null ? undefined : 'admin-login-error'}
      >
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder={DEMO_EMAIL}
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error !== null ? (
          <p id="admin-login-error" className="admin-login-error">
            {error}
          </p>
        ) : null}
        <button type="submit">Sign in to demo</button>
      </form>
      <div className="admin-login-credentials">
        <strong>Try the demo</strong>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{DEMO_EMAIL}</dd>
          </div>
          <div>
            <dt>Password</dt>
            <dd>{DEMO_PASSWORD}</dd>
          </div>
        </dl>
        <p>This is a demo login. Product changes are saved only in this browser.</p>
      </div>
      <a className="admin-login-back" href="#collection">
        Back to the collection &rarr;
      </a>
    </section>
  );
}
