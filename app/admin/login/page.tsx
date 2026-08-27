"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-lg border border-border-default bg-background-elevated p-6">
        <p className="mb-1 font-mono text-sm text-accent">$ admin login</p>
        <h1 className="mb-6 text-xl font-semibold">Sign in</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="w-full rounded-md border border-border-default bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-border-default bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {state.error && (
            <p className="font-mono text-sm text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
