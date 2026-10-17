import { randomBytes } from "node:crypto";
import { products } from "./catalog";

type CartInput = { sku: string; qty: number };
type PayPalLink = { rel?: string; href?: string };
type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
};
type PayPalOrder = {
  id?: string;
  status?: string;
  intent?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: PayPalCapture[] };
  }>;
  links?: PayPalLink[];
};

function sandboxBaseUrl(): string {
  const environment = (process.env.PAYPAL_ENVIRONMENT ?? "").trim().toLowerCase();
  if (environment !== "sandbox") {
    throw new Error("PayPal is disabled: set PAYPAL_ENVIRONMENT=sandbox to enable sandbox-only checkout.");
  }
  return "https://api-m.sandbox.paypal.com";
}

function requiredCredential(name: "PAYPAL_CLIENT_ID" | "PAYPAL_CLIENT_SECRET"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`PayPal Sandbox is not configured: missing ${name}.`);
  return value;
}

async function paypalRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${sandboxBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as {
    name?: string;
    message?: string;
    details?: Array<{ issue?: string }>;
  } & T;
  if (!response.ok) {
    const issue = body.details?.[0]?.issue ?? body.name ?? "PAYPAL_API_ERROR";
    // Never log or return credentials or access tokens.
    throw new Error(`PayPal Sandbox request failed (HTTP ${response.status}, ${issue}).`);
  }
  return body as T;
}

async function accessToken(): Promise<string> {
  const base = sandboxBaseUrl();
  const clientId = requiredCredential("PAYPAL_CLIENT_ID");
  const clientSecret = requiredCredential("PAYPAL_CLIENT_SECRET");
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Accept-Language": "en_US",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    const issue = body.error ?? "PAYPAL_OAUTH_FAILED";
    throw new Error(`PayPal Sandbox authentication failed (HTTP ${response.status}, ${issue}). Check that both credentials are Sandbox credentials with no extra spaces.`);
  }
  return body.access_token;
}

function normalizeCart(input: CartInput[]) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 20) {
    throw new Error("Cart must contain between 1 and 20 products.");
  }
  const seen = new Set<string>();
  const items = input.map(({ sku, qty }) => {
    if (typeof sku !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 10 || seen.has(sku)) {
      throw new Error("Cart contains an invalid SKU or quantity.");
    }
    seen.add(sku);
    const product = products.find((candidate) => candidate.sku === sku);
    if (!product || product.evidence !== "VERIFIED") {
      throw new Error("Checkout is blocked for unknown or unverified products.");
    }
    return { product, qty };
  });
  const totalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.qty, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
    throw new Error("Cart total is invalid.");
  }
  return { items, totalCents };
}

function publicOrigin(): string {
  const configured = process.env.BETTER_AUTH_URL?.trim();
  const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate = configured || (deploymentHost ? `https://${deploymentHost}` : "");
  if (!candidate) {
    throw new Error("PayPal checkout is blocked: configure BETTER_AUTH_URL or VERCEL_PROJECT_PRODUCTION_URL for trusted return URLs.");
  }
  const url = new URL(candidate);
  if (url.protocol !== "https:" || (process.env.VERCEL_ENV === "production" && url.hostname !== "uarefake.vercel.app" && !url.hostname.endsWith(".vercel.app"))) {
    throw new Error("PayPal checkout is blocked: return URL must be a trusted HTTPS deployment URL.");
  }
  return url.origin;
}

/** Create a Sandbox-only order using server-recomputed catalog prices. */
export async function createSandboxOrder(userId: string, input: CartInput[]) {
  if (!userId.trim()) throw new Error("Unauthorized");
  const { items, totalCents } = normalizeCart(input);
  const token = await accessToken();
  const invoiceId = `uaf-${Date.now()}-${randomBytes(6).toString("hex")}`;
  const origin = publicOrigin();
  const order = await paypalRequest<PayPalOrder>("/v2/checkout/orders", token, {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: "uarefake-marketplace",
        custom_id: userId,
        invoice_id: invoiceId,
        amount: {
          currency_code: "USD",
          value: (totalCents / 100).toFixed(2),
          breakdown: {
            item_total: { currency_code: "USD", value: (totalCents / 100).toFixed(2) },
          },
        },
        items: items.map(({ product, qty }) => ({
          name: product.title.slice(0, 127),
          sku: product.sku.slice(0, 127),
          quantity: String(qty),
          category: "DIGITAL_GOODS",
          unit_amount: { currency_code: "USD", value: (product.priceCents / 100).toFixed(2) },
        })),
      }],
      application_context: {
        brand_name: "UAREFAKE",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${origin}/cart?paypal=return`,
        cancel_url: `${origin}/cart?paypal=cancel`,
      },
    }),
  });
  const approvalUrl = order.links?.find((link) => link.rel === "approve" || link.rel === "payer-action")?.href;
  if (!order.id || !approvalUrl) throw new Error("PayPal Sandbox did not return an approval URL.");
  return { orderId: order.id, approvalUrl, environment: "sandbox" as const };
}

/**
 * Capture only an order that PayPal says belongs to the currently signed-in
 * user. This confirms a Sandbox capture; it does NOT grant marketplace access.
 */
export async function captureSandboxOrder(userId: string, orderId: string) {
  if (!userId.trim()) throw new Error("Unauthorized");
  if (!/^\w[\w.-]{4,127}$/.test(orderId)) throw new Error("Invalid PayPal order ID.");
  const token = await accessToken();
  const order = await paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, token);
  const unit = order.purchase_units?.[0];
  if (!unit || unit.custom_id !== userId || unit.amount?.currency_code !== "USD" || order.intent !== "CAPTURE") {
    throw new Error("PayPal order ownership or amount metadata could not be verified.");
  }
  if (order.status === "COMPLETED") {
    const capture = unit.payments?.captures?.find((item) => item.status === "COMPLETED");
    if (!capture || capture.amount?.currency_code !== "USD" || capture.amount.value !== unit.amount.value) {
      throw new Error("Existing PayPal capture did not match the approved order amount.");
    }
    return { orderId, captureId: capture.id ?? null, status: "COMPLETED" as const, amount: capture.amount.value, currency: "USD" as const };
  }
  if (order.status !== "APPROVED") throw new Error(`PayPal order is not approved (status ${order.status ?? "unknown"}).`);
  const captured = await paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, token, {
    method: "POST",
    body: "{}",
  });
  const capturedUnit = captured.purchase_units?.[0];
  const capture = capturedUnit?.payments?.captures?.find((item) => item.status === "COMPLETED");
  if (captured.status !== "COMPLETED" || !capture || capturedUnit?.custom_id !== userId ||
      capture.amount?.currency_code !== "USD" || capture.amount.value !== unit.amount.value) {
    throw new Error("PayPal Sandbox capture could not be independently verified.");
  }
  return { orderId, captureId: capture.id ?? null, status: "COMPLETED" as const, amount: capture.amount.value, currency: "USD" as const };
}
