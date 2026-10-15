// src/components/CheckoutButton.tsx
// Direct PayPal & Escrow Checkout Button component

import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Loader2 } from 'lucide-react';
import { createCheckoutSession, captureCheckoutOrder } from '../api/checkouts';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface CheckoutButtonProps {
  lotId: string;
  itemTitle: string;
  amount: number;
  currency?: string;
  className?: string;
  onSuccess?: () => void;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  lotId,
  itemTitle,
  amount,
  currency = 'USD',
  className = '',
  onSuccess
}) => {
  const { user } = useAuth();
  const { unlockItem } = useStore();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setStatusText('Creating PayPal Escrow...');
    try {
      const email = user?.email || 'customer@solvex-paradox-box.com';
      const session = await createCheckoutSession({
        lotId,
        itemTitle,
        amount,
        currency,
        userEmail: email
      });

      if (!session.success || !session.orderId) {
        throw new Error(session.message || 'Could not initiate checkout');
      }

      setStatusText('Capturing Settlement...');
      const capture = await captureCheckoutOrder(session.orderId, email, lotId);

      if (capture.success) {
        unlockItem(lotId);
        setStatusText('Payment Confirmed!');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(capture.message || 'Capture failed');
      }
    } catch (err: any) {
      alert(`Checkout failed: ${err?.message || 'Error processing payment'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusText(null), 3000);
    }
  };

  return (
    <button
      id={`checkout-btn-${lotId}`}
      onClick={handleCheckout}
      disabled={loading}
      className={`relative flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
          <span>{statusText || 'Processing...'}</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 text-slate-950" />
          <span>Pay with PayPal (${amount.toFixed(2)})</span>
          <ShieldCheck className="w-3.5 h-3.5 ml-1 text-slate-900" />
        </>
      )}
    </button>
  );
};
