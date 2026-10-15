import { createFileRoute } from "@tanstack/react-router";

/** Liveness only: confirms the server process can answer HTTP requests. */
export const Route = createFileRoute("/healthz")({
  server: {
    handlers: {
      GET: () =>
        new Response("ok\n", {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        }),
    },
  },
});
