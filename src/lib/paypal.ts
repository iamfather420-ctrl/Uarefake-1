import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

type CartLineInput = { sku: string; qty: number };

function validateCartInput(value: unknown): CartLineInput[] {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) {
    throw new Error("Invalid checkout request.");
  }
  return value.items.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("sku" in item) || !("qty" in item) ||
        typeof item.sku !== "string" || typeof item.qty !== "number") {
      throw new Error("Invalid cart line.");
    }
    return { sku: item.sku, qty: item.qty };
  });
}

export const createPayPalSandboxOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(validateCartInput)
  .handler(async ({ data, context }) => {
    const { createSandboxOrder } = await import("./paypal.server");
    return createSandboxOrder(context.userId, data);
  });

export const capturePayPalSandboxOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((value: unknown) => {
    if (!value || typeof value !== "object" || !("orderId" in value) || typeof value.orderId !== "string") {
      throw new Error("Invalid PayPal capture request.");
    }
    return value.orderId;
  })
  .handler(async ({ data, context }) => {
    const { captureSandboxOrder } = await import("./paypal.server");
    return captureSandboxOrder(context.userId, data);
  });
