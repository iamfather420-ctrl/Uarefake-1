import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

type CartLineInput = { sku: string; qty: number };

function validateCartInput(value: unknown): { items: CartLineInput[]; idempotencyKey: string } {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items) || !("idempotencyKey" in value) || typeof value.idempotencyKey !== "string") {
    throw new Error("Invalid checkout request.");
  }
  const items = value.items.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("sku" in item) || !("qty" in item) || typeof item.sku !== "string" || typeof item.qty !== "number") {
      throw new Error("Invalid cart line.");
    }
    return { sku: item.sku, qty: item.qty };
  });
  return { items, idempotencyKey: value.idempotencyKey };
}

export const createPayPalOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(validateCartInput)
  .handler(async ({ data, context }) => {
    const { createPayPalOrder: create } = await import("./paypal.server");
    return create(context.userId, data.items, data.idempotencyKey);
  });

export const capturePayPalOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((value: unknown) => {
    if (!value || typeof value !== "object" || !("orderId" in value) || typeof value.orderId !== "string") {
      throw new Error("Invalid PayPal capture request.");
    }
    return value.orderId;
  })
  .handler(async ({ data, context }) => {
    const { capturePayPalOrder: capture } = await import("./paypal.server");
    return capture(context.userId, data);
  });

// Compatibility exports for clients that have not yet migrated their imports.
export const createPayPalSandboxOrder = createPayPalOrder;
export const capturePayPalSandboxOrder = capturePayPalOrder;
