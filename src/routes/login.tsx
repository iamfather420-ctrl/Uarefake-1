import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

const getAuthAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { authConfigured } = await import("@/lib/auth/server");
  return { configured: authConfigured };
});

export const Route = createFileRoute("/login")({
  loader: () => getAuthAvailability(),
  component: LoginPage,
});

function LoginPage() {
  const { configured } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-5 px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">SOLVEX · Identity</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Sign in</h1>
      {configured ? (
        <>
          <p className="text-sm text-muted">
            Use the configured identity provider. A valid session is required before tenant data can be accessed.
          </p>
          <div className="grid gap-3">
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                onClick={() => {
                  setError(null);
                  void signIn(provider.providerId, { callbackURL: "/" }).catch((reason: unknown) => {
                    setError(reason instanceof Error ? reason.message : "Sign-in could not be completed.");
                  });
                }}
              >
                Continue with {provider.label}
              </Button>
            ))}
          </div>
          {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}
        </>
      ) : (
        <p role="status" className="rounded-lg border border-line p-4 text-sm text-muted">
          Authentication is not provisioned for this deployment. No preview credentials or simulated users are used here.
        </p>
      )}
      <Link to="/" className="text-sm underline underline-offset-4">Return to home</Link>
    </main>
  );
}
