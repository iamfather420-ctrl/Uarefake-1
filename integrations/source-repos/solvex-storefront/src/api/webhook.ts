// src/api/webhook.ts
// PayPal Webhook & IPN Handler with Neon DB Settlement Dispatch

import {
  upsertUser,
  recordPurchase,
  logPaymentLedger,
  unlockLot,
  formatNumeric10_2
} from '../db/neon';

export interface PayPalWebhookEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: {
    id: string;
    status: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    custom_id?: string;
    payer?: {
      email_address: string;
      payer_id: string;
    };
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount?: {
            value: string;
            currency_code: string;
          };
        }>;
      };
    }>;
  };
}

export class PayPalWebhookHandler {
  public static async processWebhook(event: PayPalWebhookEvent): Promise<{
    handled: boolean;
    eventType: string;
    settled: boolean;
    purchaseId?: string;
    userId?: string;
    unlockedLots?: string[];
  }> {
    console.log(`[PayPal Webhook] Received ${event.event_type} (${event.id})`);

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.COMPLETED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = event.resource;
        const paypalOrderId = resource.id || `PP-ORD-${Date.now()}`;
        const captureId = resource.purchase_units?.[0]?.payments?.captures?.[0]?.id || resource.id;
        const amountVal = formatNumeric10_2(resource.amount?.value || '0.00');
        const currency = resource.amount?.currency_code || 'USD';
        const userEmail = resource.payer?.email_address || 'customer@uarefake.com';
        const rawLotIds = resource.custom_id || resource.purchase_units?.[0]?.reference_id || 'GENERAL-LOT';
        const lotIdList = rawLotIds.split(',').map(s => s.trim()).filter(Boolean);

        // 1. Upsert User in Neon
        const user = await upsertUser(userEmail);

        // 2. Record Purchase with status CAPTURED
        const purchase = await recordPurchase({
          userId: user.id,
          paypalOrderId,
          lotIds: rawLotIds,
          totalAmount: amountVal,
          currency,
          status: 'CAPTURED'
        });

        // 3. Log into Payment Ledger
        await logPaymentLedger({
          userId: user.id,
          paypalOrderId,
          paypalCaptureId: captureId,
          eventType: 'ORDER_CAPTURED',
          amount: amountVal,
          currency,
          rawPayload: event
        });

        // 4. Unlock all purchased lots
        for (const lotId of lotIdList) {
          await unlockLot({ userId: user.id, lotId });
        }

        return {
          handled: true,
          eventType: event.event_type,
          settled: true,
          purchaseId: purchase.id,
          userId: user.id,
          unlockedLots: lotIdList
        };
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        console.warn(`[PayPal Webhook] Reversal/Denial event: ${event.event_type}`);
        return {
          handled: true,
          eventType: event.event_type,
          settled: false
        };
      }

      default:
        return {
          handled: true,
          eventType: event.event_type,
          settled: false
        };
    }
  }
}
