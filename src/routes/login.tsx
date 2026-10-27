import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient, authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

type LoginMode = "sign-in" | "sign-up";

function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!authEnabled) {
      setError("Authentication is disabled for this deployment. No session was created.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    if (!email || !password) {
      setError("Enter both your email and password.");
      return;
    }
    if (mode === "sign-up" && (!name || password.length < 12)) {
      setError("Enter your name and choose a password with at least 12 characters.");
      return;
    }

    setBusy(true);
    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password, callbackURL: "/" })
          : await authClient.signUp.email({ name, email, password, callbackURL: "/" });
      if (result.error) {
        setError(result.error.message || "Authentication failed. No session was confirmed.");
        return;
      }
      setNotice(mode === "sign-up" ? "Account created. Redirecting…" : "Signed in. Redirecting…");
      window.location.assign("/");
    } catch {
      setError("Authentication could not be verified. No success is assumed; try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-xl border border-line bg-surface p-6">
        <p className="font-mono text-2xs uppercase tracking-mark text-muted">SOLVEX + DAISY HAMINJA</p>
        <h1 className="mt-3 text-2xl font-semibold text-fg">Self-hosted sign-in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your account is managed by this application. Production sign-in remains blocked until the
          independent recovery, tenant-isolation, database, and backup gates are verified.
        </p>

        {!authEnabled ? (
          <div role="status" className="mt-5 rounded-md border border-amber-700/60 bg-amber-950/20 p-3 text-sm text-amber-200">
            Authentication is disabled in this environment. No sign-in or account creation was attempted.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "sign-up" ? (
              <label className="block space-y-1.5 text-sm">
                <span className="text-fg">Name</span>
                <input name="name" autoComplete="name" maxLength={120} required className="w-full rounded-md border border-line bg-bg px-3 py-2 text-fg" />
              </label>
            ) : null}
            <label className="block space-y-1.5 text-sm">
              <span className="text-fg">Email</span>
              <input name="email" type="email" autoComplete="email" maxLength={254} required className="w-full rounded-md border border-line bg-bg px-3 py-2 text-fg" />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-fg">Password</span>
              <input name="password" type="password" autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={mode === "sign-up" ? 12 : 1} maxLength={128} required className="w-full rounded-md border border-line bg-bg px-3 py-2 text-fg" />
              {mode === "sign-up" ? <span className="block text-xs text-muted">Use at least 12 characters.</span> : null}
            </label>
            {error ? <p role="alert" className="rounded-md border border-red-800/70 bg-red-950/20 p-3 text-sm text-red-200">{error}</p> : null}
            {notice ? <p role="status" className="text-sm text-emerald-300">{notice}</p> : null}
            <button type="submit" disabled={busy} className="w-full rounded-md bg-stamp px-4 py-2.5 text-sm font-semibold text-stamp-fg disabled:opacity-50">
              {busy ? "Verifying…" : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
            <button type="button" disabled={busy} onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); setNotice(null); }} className="w-full rounded-md border border-line px-4 py-2.5 text-sm text-fg disabled:opacity-50">
              {mode === "sign-in" ? "Create a new account" : "I already have an account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted"><Link to="/" className="underline underline-offset-4">Return to SOLVEX</Link></p>
      </section>
    </main>
  );
}
