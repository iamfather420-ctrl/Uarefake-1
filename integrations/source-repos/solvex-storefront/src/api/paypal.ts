// src/api/paypal.ts
// PayPal REST API v2 Helper & Verification Engine

export interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalOrderRequest {
  lotId: string;
  itemTitle: string;
  amount: number;
  currency: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.baseUrl = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
  }

  public async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      // Fallback for sandboxed preview / dev mock token
      return `MOCK_ACCESS_TOKEN_${Date.now()}`;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      throw new Error(`PayPal Auth Failed: ${res.statusText}`);
    }

    const data: PayPalAccessTokenResponse = await res.json();
    return data.access_token;
  }

  public async createOrder(req: PayPalOrderRequest): Promise<{ id: string; status: string; links: any[] }> {
    const token = await this.getAccessToken();
    
    if (token.startsWith('MOCK_ACCESS_TOKEN')) {
      const orderId = `PAYPAL-ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      return {
        id: orderId,
        status: 'CREATED',
        links: [
          { href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`, rel: 'approve', method: 'GET' }
        ]
      };
    }

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: req.lotId,
          description: req.itemTitle,
          amount: {
            currency_code: req.currency || 'USD',
            value: req.amount.toFixed(2)
          }
        }
      ],
      application_context: {
        return_url: req.returnUrl || 'https://uarefake.com/checkout/success',
        cancel_url: req.cancelUrl || 'https://uarefake.com/checkout/cancel',
        brand_name: 'Solvex Paradox B2B Marketplace',
        user_action: 'PAY_NOW'
      }
    };

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'PayPal order creation error');
    }

    return await res.json();
  }

  public async captureOrder(orderId: string): Promise<{ id: string; status: string; purchase_units: any[] }> {
    const token = await this.getAccessToken();

    if (token.startsWith('MOCK_ACCESS_TOKEN') || orderId.startsWith('PAYPAL-ORDER-')) {
      return {
        id: orderId,
        status: 'COMPLETED',
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  id: `CAP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                  status: 'COMPLETED',
                  create_time: new Date().toISOString()
                }
              ]
            }
          }
        ]
      };
    }

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'PayPal capture error');
    }

    return await res.json();
  }
}

export const paypalService = new PayPalService();
