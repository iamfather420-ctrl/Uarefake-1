// src/api/checkouts.ts
// Direct Checkout API client for PayPal Orders & Neon Ledger Synchronization

export interface CheckoutPayload {
  lotId: string;
  itemTitle: string;
  amount: number;
  currency?: string;
  userEmail: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  approvalUrl?: string;
  captureId?: string;
  transactionHash?: string;
  message?: string;
}

export async function createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutResponse> {
  try {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lotId: payload.lotId,
        itemTitle: payload.itemTitle,
        amount: payload.amount,
        currency: payload.currency || 'USD',
        userEmail: payload.userEmail
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create checkout order');
    }

    return await res.json();
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return {
      success: false,
      message: error?.message || 'Network error during checkout initialization'
    };
  }
}

export async function captureCheckoutOrder(orderId: string, userEmail: string, lotId: string): Promise<CheckoutResponse> {
  try {
    const res = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, userEmail, lotId })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to capture checkout order');
    }

    return await res.json();
  } catch (error: any) {
    console.error('Capture API error:', error);
    return {
      success: false,
      message: error?.message || 'Network error during payment capture'
    };
  }
}
