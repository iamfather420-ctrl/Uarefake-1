// src/context/StoreContext.tsx
// Global Store Context providing state for Items, Cart, Checkout, and Neon Persistence

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SolutionItem } from '../types';
import { INITIAL_SOLUTIONS } from '../data/allSolutionsData';

export interface CartItem {
  item: SolutionItem;
  quantity: number;
}

interface StoreContextType {
  items: SolutionItem[];
  cart: CartItem[];
  addToCart: (item: SolutionItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  unlockedItems: string[];
  unlockItem: (itemId: string) => void;
  isItemUnlocked: (itemId: string) => boolean;
  hydrateUnlockedLots: (emailOrUserId?: string) => Promise<void>;
  neonSynced: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items] = useState<SolutionItem[]>([...INITIAL_SOLUTIONS]);
  const [neonSynced, setNeonSynced] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('solvex_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('solvex_unlocked_items_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('solvex_cart_v1', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('solvex_unlocked_items_v1', JSON.stringify(unlockedItems));
  }, [unlockedItems]);

  const hydrateUnlockedLots = useCallback(async (emailOrUserId?: string) => {
    try {
      let queryParam = '';
      if (emailOrUserId) {
        queryParam = emailOrUserId.includes('@') ? `email=${encodeURIComponent(emailOrUserId)}` : `userId=${encodeURIComponent(emailOrUserId)}`;
      } else {
        const storedSession = localStorage.getItem('solvex_auth_session');
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            if (parsed.email) {
              queryParam = `email=${encodeURIComponent(parsed.email)}`;
            } else if (parsed.userId) {
              queryParam = `userId=${encodeURIComponent(parsed.userId)}`;
            }
          } catch {
            // fallback
          }
        }
      }

      if (!queryParam) {
        queryParam = 'email=customer@uarefake.com';
      }

      const res = await fetch(`/api/unlocked-lots?${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.unlockedLots) && data.unlockedLots.length > 0) {
          setUnlockedItems(prev => {
            const combined = Array.from(new Set([...prev, ...data.unlockedLots]));
            return combined;
          });
          setNeonSynced(true);
        }
      }
    } catch (err) {
      console.warn('[StoreContext] Could not fetch unlocked lots from Neon:', err);
    }
  }, []);

  useEffect(() => {
    hydrateUnlockedLots();
  }, [hydrateUnlockedLots]);

  const addToCart = (item: SolutionItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, ci) => acc + (ci.item.price * ci.quantity), 0);

  const unlockItem = (itemId: string) => {
    setUnlockedItems(prev => prev.includes(itemId) ? prev : [...prev, itemId]);
  };

  const isItemUnlocked = (itemId: string) => unlockedItems.includes(itemId);

  return (
    <StoreContext.Provider value={{
      items,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      unlockedItems,
      unlockItem,
      isItemUnlocked,
      hydrateUnlockedLots,
      neonSynced
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
};
