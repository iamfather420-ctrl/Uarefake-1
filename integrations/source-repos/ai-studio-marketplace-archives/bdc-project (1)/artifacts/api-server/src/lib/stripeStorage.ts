import { db } from "@workspace/db";
import { usersTable, paradoxProductsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const stripeStorage = {
  async getUser(userId: string) {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      return user || null;
    } catch (err) {
      console.error("Error in stripeStorage.getUser:", err);
      return null;
    }
  },

  async updateUserStripeCustomer(userId: string, stripeCustomerId: string) {
    try {
      await db
        .update(usersTable)
        .set({ stripeCustomerId })
        .where(eq(usersTable.id, userId));
    } catch (err) {
      console.error("Error in stripeStorage.updateUserStripeCustomer:", err);
    }
  },

  async listProductsWithPrices() {
    try {
      const products = await db.select().from(paradoxProductsTable);
      return products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceUsdc: p.priceUsdc,
        priceEth: p.priceEth,
        priceBtc: p.priceBtc,
        category: p.category,
      }));
    } catch (err) {
      console.error("Error in stripeStorage.listProductsWithPrices:", err);
      return [];
    }
  },
};
