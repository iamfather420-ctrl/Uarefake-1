import { Router } from "express";
import { stripeService } from "../lib/stripeService";
import { stripeStorage } from "../lib/stripeStorage";
import { db } from "@workspace/db";
import { ordersTable, paradoxProductsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/stripe/checkout", async (_req: any, res) => {
  res.json({ url: "https://PayPal.me/tjites", orderId: "paypal_tjites" });
});

router.post("/paypal/checkout", async (_req: any, res) => {
  res.json({ url: "https://PayPal.me/tjites", orderId: "paypal_tjites" });
});

router.get("/stripe/session/:sessionId", async (req: any, res) => {
  try {
    const session = await stripeService.getCheckoutSession(req.params.sessionId);
    res.json({
      status: session.payment_status,
      orderId: session.metadata?.orderId,
      productId: session.metadata?.productId,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (err: any) {
    req.log.error({ err }, "Stripe session lookup error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/stripe/orders", async (req: any, res) => {
  try {
    const userId = (req.session as any)?.userId ?? "1";
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId));
    res.json(orders.filter((o: any) => o.paymentMethod === "stripe"));
  } catch (err: any) {
    req.log.error({ err }, "Stripe orders error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/stripe/products", async (_req: any, res) => {
  try {
    const products = await stripeStorage.listProductsWithPrices();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
