import { createFileRoute } from "@tanstack/react-router";
import { auth, authConfigured } from "@/lib/auth/server";

function unavailable(): Response {
  return Response.json(
    { error: "Authentication is not provisioned for this deployment." },
    { status: 503, headers: { "cache-control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => authConfigured ? auth.handler(request) : unavailable(),
      POST: ({ request }) => authConfigured ? auth.handler(request) : unavailable(),
    },
  },
});
