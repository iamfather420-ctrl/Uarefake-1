// src/pages/checkout.tsx
// Standalone Checkout Page for review, PayPal authorization, and order confirmation

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShoppingCart, ArrowLeft, CheckCircle2, Lock, Sparkles, Trash2 } from 'lucide-react';
import { createCheckoutSession, captureCheckoutOrder } from '../api/checkouts';

export const CheckoutPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { cart, removeFromCart, clearCart, cartTotal, unlockItem } = useStore();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const handlePayPalCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const email = user?.email || 'customer@solvex-paradox-box.com';
      const session = await createCheckoutSession({
        lotId: cart.map(c => c.item.id).join(','),
        itemTitle: `Solvex Order (${cart.length} items)`,
        amount: cartTotal,
        currency: 'USD',
        userEmail: email
      });

      if (!session.success || !session.orderId) {
        throw new Error(session.message || 'Payment initialization failed');
      }

      const capture = await captureCheckoutOrder(session.orderId, email, cart.map(c => c.item.id).join(','));
      if (capture.success) {
        cart.forEach(ci => unlockItem(ci.item.id));
        setLastOrderId(session.orderId);
        setOrderComplete(true);
        clearCart();
      } else {
        throw new Error(capture.message || 'Payment capture failed');
      }
    } catch (err: any) {
      alert(`Checkout error: ${err?.message || 'Payment failed'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs mb-6 font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO STOREFRONT</span>
        </button>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-amber-400" />
              <span>PayPal B2B Escrow Checkout</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic 380-Byte node authorization with Neon DB transactional ledger
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-mono font-bold">
            PAYPAL READY
          </span>
        </div>

        {orderComplete ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Order Confirmed & Settled</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Your software licenses and blueprints are permanently unlocked in Neon DB under transaction order <span className="font-mono text-emerald-400">{lastOrderId}</span>.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition-all"
              >
                RETURN TO CATALOG
              </button>
            )}
          </div>
        ) : cart.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm mb-4">Your cart is currently empty.</p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono"
              >
                Browse Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="divide-y divide-slate-800">
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      Qty: {quantity} &times; ${item.price.toFixed(2)} USD
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      ${(item.price * quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">Total Settlement Amount:</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${cartTotal.toFixed(2)} USD
              </span>
            </div>

            <button
              onClick={handlePayPalCheckout}
              disabled={processing}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-slate-950" />
              <span>{processing ? 'Processing PayPal Payment...' : `Authorize & Pay with PayPal ($${cartTotal.toFixed(2)})`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CheckoutPage;
