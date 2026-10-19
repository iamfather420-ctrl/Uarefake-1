import { createFileRoute } from "@tanstack/react-router";
import { processPayPalWebhook, verifyPayPalWebhook } from "@/lib/paypal.server";

export const Route = createFileRoute("/api/paypal/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (!raw || raw.length > 512_000) return Response.json({ error: "invalid webhook" }, { status: 400 });
          const event = JSON.parse(raw) as Record<string, unknown>;
          await verifyPayPalWebhook(request.headers, event);
          const result = await processPayPalWebhook(event);
          return Response.json({ ok: true, ...result }, { status: 200, headers: { "cache-control": "no-store" } });
        } catch (error) {
          // PayPal retries non-2xx responses. Do not expose provider details or secrets.
          const message = error instanceof Error ? error.message : "webhook processing failed";
          const retryable = /not persisted yet|database|timeout|fetch|network|temporarily/i.test(message);
          return Response.json({ error: retryable ? "temporarily unavailable" : "webhook rejected" }, { status: retryable ? 503 : 400, headers: { "cache-control": "no-store" } });
        }
      },
    },
  },
});
