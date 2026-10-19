import { createHash, randomBytes } from "node:crypto";
import { products } from "./catalog";
import { getSql } from "./db";
import { getPayPalConfig, type PayPalConfig, type PayPalEnvironment } from "./paypal-config";

type CartInput = { sku: string; qty: number };
type PayPalLink = { rel?: string; href?: string };
type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
  seller_protection?: { status?: string };
};
type PayPalOrder = {
  id?: string;
  status?: string;
  intent?: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    invoice_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: PayPalCapture[] };
  }>;
  links?: PayPalLink[];
};

type PaymentRow = {
  id: string;
  tenant_id: string;
  user_id: string;
  idempotency_key: string;
  cart_hash: string;
  cart_json: string;
  amount_cents: number;
  currency: string;
  environment: PayPalEnvironment;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  invoice_id: string;
  status: string;
  capture_amount_cents: number | null;
  capture_currency: string | null;
};

const LIVE_HOSTS = new Set(["www.paypal.com", "paypal.com", "www.paypalobjects.com"]);
const SANDBOX_HOSTS = new Set(["www.sandbox.paypal.com", "sandbox.paypal.com"]);

function tenantId(): string {
  if (process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase() === "live") {
    const value = process.env.SOLVEX_TENANT_ID?.trim();
    if (!value) throw new Error("PayPal Live payments require SOLVEX_TENANT_ID.");
    return value;
  }
  return process.env.SOLVEX_TENANT_ID?.trim() || "sandbox-tenant";
}

function assertApprovalUrl(value: string, config: PayPalConfig): string {
  const url = new URL(value);
  const allowed = config.environment === "live" ? LIVE_HOSTS : SANDBOX_HOSTS;
  if (url.protocol !== "https:" || !allowed.has(url.hostname)) {
    throw new Error("PayPal returned an untrusted approval URL.");
  }
  return url.toString();
}

async function paypalRequest<T>(config: PayPalConfig, path: string, token: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
    const body = (await response.json().catch(() => ({}))) as { name?: string; details?: Array<{ issue?: string }> } & T;
    if (!response.ok) {
      const issue = body.details?.[0]?.issue ?? body.name ?? "PAYPAL_API_ERROR";
      throw new Error(`PayPal request failed (HTTP ${response.status}, ${issue}).`);
    }
    return body as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function accessToken(config: PayPalConfig): Promise<string> {
  const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const body = (await response.json().catch(() => ({}))) as { access_token?: string; error?: string };
    if (!response.ok || !body.access_token) {
      throw new Error(`PayPal ${config.environment} authentication failed (HTTP ${response.status}, ${body.error ?? "OAUTH_FAILED"}).`);
    }
    return body.access_token;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCart(input: CartInput[]) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 20) throw new Error("Cart must contain between 1 and 20 products.");
  const seen = new Set<string>();
  const items = input.map(({ sku, qty }) => {
    if (typeof sku !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 10 || seen.has(sku)) throw new Error("Cart contains an invalid SKU or quantity.");
    seen.add(sku);
    const product = products.find((candidate) => candidate.sku === sku);
    if (!product || product.evidence !== "VERIFIED") throw new Error("Checkout is blocked for unknown or unverified products.");
    return { product, qty };
  });
  const totalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.qty, 0);
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) throw new Error("Cart total is invalid.");
  return { items, totalCents };
}

function cartSnapshot(items: ReturnType<typeof normalizeCart>["items"]): string {
  return JSON.stringify(items.map(({ product, qty }) => ({ sku: product.sku, title: product.title, priceCents: product.priceCents, qty })));
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function publicOrigin(): string {
  const configured = process.env.BETTER_AUTH_URL?.trim();
  const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidate = configured || (deploymentHost ? `https://${deploymentHost}` : "");
  if (!candidate) throw new Error("PayPal checkout requires a trusted HTTPS application origin.");
  const url = new URL(candidate);
  if (url.protocol !== "https:" || (process.env.VERCEL_ENV === "production" && url.hostname !== "uarefake.vercel.app" && !url.hostname.endsWith(".vercel.app"))) {
    throw new Error("PayPal checkout requires a trusted HTTPS deployment URL.");
  }
  return url.origin;
}

function validIdempotencyKey(value: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(value)) throw new Error("Invalid payment idempotency key.");
  return value;
}

async function findPayment(config: PayPalConfig, userId: string, orderId: string): Promise<PaymentRow | null> {
  const sql = await getSql();
  const rows = await sql.query<PaymentRow>(
    "select * from payment_orders where tenant_id = $1 and user_id = $2 and paypal_order_id = $3 limit 1",
    [tenantId(), userId, orderId],
  );
  return rows[0] ?? null;
}

export async function createPayPalOrder(userId: string, input: CartInput[], idempotencyKey: string) {
  if (!userId.trim()) throw new Error("Unauthorized");
  const config = getPayPalConfig();
  const key = validIdempotencyKey(idempotencyKey);
  const { items, totalCents } = normalizeCart(input);
  const snapshot = cartSnapshot(items);
  const cartHash = hash(snapshot);
  const sql = await getSql();
  const internalId = `pay_${Date.now().toString(36)}_${randomBytes(8).toString("hex")}`;
  const invoiceId = `uaf-${Date.now()}-${randomBytes(6).toString("hex")}`;
  const inserted = await sql.query<PaymentRow>(
    `insert into payment_orders
      (id, tenant_id, user_id, idempotency_key, cart_hash, cart_json, amount_cents, currency, environment, invoice_id, status, created_at, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,'USD',$8,$9,'CREATING',extract(epoch from now())::bigint,extract(epoch from now())::bigint)
     on conflict (tenant_id, user_id, idempotency_key) do update set updated_at = payment_orders.updated_at
     returning *`,
    [internalId, tenantId(), userId, key, cartHash, snapshot, totalCents, config.environment, invoiceId],
  );
  const payment = inserted[0];
  if (!payment || payment.cart_hash !== cartHash || payment.amount_cents !== totalCents) throw new Error("Idempotency key was already used for a different cart.");
  if (payment.paypal_order_id) {
    const token = await accessToken(config);
    const existing = await paypalRequest<PayPalOrder>(config, `/v2/checkout/orders/${encodeURIComponent(payment.paypal_order_id)}`, token);
    const approvalUrl = existing.links?.find((link) => link.rel === "approve" || link.rel === "payer-action")?.href;
    if (!approvalUrl) throw new Error("Existing PayPal order has no approval URL.");
    return { orderId: payment.paypal_order_id, approvalUrl: assertApprovalUrl(approvalUrl, config), environment: config.environment, paymentId: payment.id };
  }

  const token = await accessToken(config);
  const order = await paypalRequest<PayPalOrder>(config, "/v2/checkout/orders", token, {
    method: "POST",
    headers: { "PayPal-Request-Id": payment.id },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: "uarefake-marketplace",
        custom_id: userId,
        invoice_id: payment.invoice_id,
        amount: { currency_code: "USD", value: (totalCents / 100).toFixed(2), breakdown: { item_total: { currency_code: "USD", value: (totalCents / 100).toFixed(2) } } },
        items: items.map(({ product, qty }) => ({ name: product.title.slice(0, 127), sku: product.sku.slice(0, 127), quantity: String(qty), category: "DIGITAL_GOODS", unit_amount: { currency_code: "USD", value: (product.priceCents / 100).toFixed(2) } })),
      }],
      application_context: { brand_name: "UAREFAKE", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: `${publicOrigin()}/cart?paypal=return`, cancel_url: `${publicOrigin()}/cart?paypal=cancel` },
    }),
  });
  const approvalUrl = order.links?.find((link) => link.rel === "approve" || link.rel === "payer-action")?.href;
  if (!order.id || !approvalUrl) throw new Error("PayPal did not return a valid approval URL.");
  await sql.query("update payment_orders set paypal_order_id = $1, status = 'APPROVAL_PENDING', updated_at = extract(epoch from now())::bigint where id = $2 and status = 'CREATING'", [order.id, payment.id]);
  return { orderId: order.id, approvalUrl: assertApprovalUrl(approvalUrl, config), environment: config.environment, paymentId: payment.id };
}

function cents(value: string | undefined): number {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) throw new Error("PayPal returned an invalid monetary amount.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function assertMatchingOrder(order: PayPalOrder, payment: PaymentRow, userId: string) {
  const unit = order.purchase_units?.[0];
  if (!unit || unit.custom_id !== userId || unit.invoice_id !== payment.invoice_id || unit.amount?.currency_code !== payment.currency || cents(unit.amount.value) !== payment.amount_cents || order.intent !== "CAPTURE") {
    throw new Error("PayPal order ownership, currency, or amount could not be verified.");
  }
  return unit;
}

export async function capturePayPalOrder(userId: string, orderId: string) {
  if (!userId.trim()) throw new Error("Unauthorized");
  if (!/^\w[\w.-]{4,127}$/.test(orderId)) throw new Error("Invalid PayPal order ID.");
  const config = getPayPalConfig();
  const payment = await findPayment(config, userId, orderId);
  if (!payment) throw new Error("Payment order not found for the authenticated user.");
  if (payment.environment !== config.environment) throw new Error("Payment environment mismatch.");
  if (payment.status === "CAPTURED" && payment.paypal_capture_id) return { orderId, captureId: payment.paypal_capture_id, status: "COMPLETED" as const, amount: ((payment.capture_amount_cents ?? payment.amount_cents) / 100).toFixed(2), currency: payment.capture_currency ?? payment.currency, environment: config.environment };

  const sql = await getSql();
  const claimed = await sql.query<PaymentRow>("update payment_orders set status = 'CAPTURE_REQUESTED', updated_at = extract(epoch from now())::bigint where id = $1 and status in ('APPROVAL_PENDING','APPROVED') returning *", [payment.id]);
  if (!claimed[0] && payment.status === "CAPTURE_REQUESTED") throw new Error("Capture is already in progress; retry status verification shortly.");
  const token = await accessToken(config);
  const order = await paypalRequest<PayPalOrder>(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, token);
  const unit = assertMatchingOrder(order, payment, userId);
  if (order.status === "COMPLETED") {
    const capture = unit.payments?.captures?.find((item) => item.status === "COMPLETED");
    if (!capture || cents(capture.amount?.value) !== payment.amount_cents || capture.amount?.currency_code !== payment.currency) throw new Error("Completed PayPal capture did not match the expected amount.");
    await sql.query("update payment_orders set status='CAPTURED', paypal_capture_id=$1, capture_amount_cents=$2, capture_currency=$3, captured_at=extract(epoch from now())::bigint, updated_at=extract(epoch from now())::bigint where id=$4", [capture.id ?? null, payment.amount_cents, payment.currency, payment.id]);
    return { orderId, captureId: capture.id ?? null, status: "COMPLETED" as const, amount: (payment.amount_cents / 100).toFixed(2), currency: payment.currency, environment: config.environment };
  }
  if (order.status !== "APPROVED") throw new Error(`PayPal order is not approved (status ${order.status ?? "unknown"}).`);
  const captured = await paypalRequest<PayPalOrder>(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, token, { method: "POST", headers: { "PayPal-Request-Id": `${payment.id}:capture` }, body: "{}" });
  const capturedUnit = assertMatchingOrder(captured, payment, userId);
  const capture = capturedUnit.payments?.captures?.find((item) => item.status === "COMPLETED");
  if (captured.status !== "COMPLETED" || !capture || cents(capture.amount?.value) !== payment.amount_cents || capture.amount?.currency_code !== payment.currency) throw new Error("PayPal capture could not be independently verified.");
  await sql.query("update payment_orders set status='CAPTURED', paypal_capture_id=$1, capture_amount_cents=$2, capture_currency=$3, captured_at=extract(epoch from now())::bigint, updated_at=extract(epoch from now())::bigint where id=$4", [capture.id ?? null, payment.amount_cents, payment.currency, payment.id]);
  return { orderId, captureId: capture.id ?? null, status: "COMPLETED" as const, amount: (payment.amount_cents / 100).toFixed(2), currency: payment.currency, environment: config.environment };
}

export async function verifyPayPalWebhook(headers: Headers, event: Record<string, unknown>) {
  const config = getPayPalConfig();
  if (!config.webhookId) throw new Error("PayPal webhook is not configured.");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) throw new Error("PayPal webhook headers are incomplete.");
  const cert = new URL(certUrl);
  if (cert.protocol !== "https:" || cert.hostname !== new URL(config.baseUrl).hostname) throw new Error("PayPal webhook certificate URL is not trusted.");
  const token = await accessToken(config);
  const result = await paypalRequest<{ verification_status?: string }>(config, "/v1/notifications/verify-webhook-signature", token, {
    method: "POST",
    body: JSON.stringify({ transmission_id: transmissionId, transmission_time: transmissionTime, cert_url: certUrl, auth_algo: authAlgo, transmission_sig: transmissionSig, webhook_id: config.webhookId, webhook_event: event }),
  });
  if (result.verification_status !== "SUCCESS") throw new Error("PayPal webhook signature verification failed.");
}

export async function processPayPalWebhook(event: Record<string, any>) {
  const config = getPayPalConfig();
  const eventId = typeof event.id === "string" ? event.id : "";
  const eventType = typeof event.event_type === "string" ? event.event_type : "";
  if (!eventId || !eventType) throw new Error("PayPal webhook event is malformed.");
  const resource = event.resource ?? {};
  const related = resource?.supplementary_data?.related_ids ?? {};
  const orderId = related.order_id ?? resource?.custom_id ?? null;
  const captureId = resource?.id ?? null;
  const sql = await getSql();
  const eventRows = await sql.query<{ status: string }>(
    `insert into payment_events (id,event_type,resource_id,paypal_order_id,status,received_at,updated_at)
     values ($1,$2,$3,$4,'RECEIVED',extract(epoch from now())::bigint,extract(epoch from now())::bigint)
     on conflict (id) do nothing returning status`,
    [eventId, eventType, captureId, orderId],
  );
  if (!eventRows[0]) {
    const existing = await sql.query<{ status: string }>("select status from payment_events where id=$1", [eventId]);
    if (existing[0]?.status === "PROCESSED") return { duplicate: true };
  }
  const payment = orderId ? (await sql.query<PaymentRow>("select * from payment_orders where paypal_order_id=$1 limit 1", [orderId]))[0] : null;
  if (!payment) {
    await sql.query("update payment_events set status='RETRY', error='payment order not found', updated_at=extract(epoch from now())::bigint where id=$1", [eventId]);
    throw new Error("Payment order is not persisted yet; retry webhook.");
  }
  let nextStatus: string | null = null;
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const amount = cents(resource.amount?.value);
    if (resource.amount?.currency_code !== payment.currency || amount !== payment.amount_cents) nextStatus = "REVIEW_REQUIRED";
    else nextStatus = "CAPTURED";
  } else if (eventType === "PAYMENT.CAPTURE.REFUNDED" || eventType === "PAYMENT.CAPTURE.REVERSED" || eventType.startsWith("CUSTOMER.DISPUTE.")) {
    nextStatus = "REVIEW_REQUIRED";
  }
  if (nextStatus) {
    await sql.query("update payment_orders set status=$1, paypal_capture_id=coalesce(paypal_capture_id,$2), updated_at=extract(epoch from now())::bigint where id=$3", [nextStatus, captureId, payment.id]);
  }
  await sql.query("update payment_events set status='PROCESSED', processed_at=extract(epoch from now())::bigint, updated_at=extract(epoch from now())::bigint where id=$1", [eventId]);
  return { duplicate: false, status: nextStatus ?? "IGNORED", environment: config.environment };
}

// Backwards-compatible aliases for callers that still use the Sandbox names.
export const createSandboxOrder = (userId: string, input: CartInput[], idempotencyKey = `legacy-${Date.now()}-${randomBytes(6).toString("hex")}`) => createPayPalOrder(userId, input, idempotencyKey);
export const captureSandboxOrder = capturePayPalOrder;
