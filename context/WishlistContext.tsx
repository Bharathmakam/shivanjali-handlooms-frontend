'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '@/lib/api';
import type { WishlistContextType, Product, WishlistItem } from '@/types';

const WishlistContext = createContext<WishlistContextType | null>(null);

function getWishlistFromStorage(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wishlist', JSON.stringify(items));
}

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>(getWishlistFromStorage);
  const { user } = useAuth();
  const syncAttempted = useRef(false);

  useEffect(() => {
    saveWishlistToStorage(items);
  }, [items]);

  // Sync from backend when user logs in
  useEffect(() => {
    if (!user) {
      syncAttempted.current = false;
      return;
    }
    if (syncAttempted.current) return;
    syncAttempted.current = true;

    async function syncFromBackend() {
      try {
        const backendItems = await getWishlist();
        setItems((prev) => {
          const backendIds = new Set(backendItems.map((bi) => bi.productId));
          const localOnly = prev.filter((item) => !backendIds.has(item.productId));
          return [...backendItems, ...localOnly];
        });

        // Push local-only items to backend
        const currentLocal = getWishlistFromStorage();
        const backendIds = new Set(backendItems.map((bi) => bi.productId));
        const localOnly = currentLocal.filter((item) => !backendIds.has(item.productId));
        for (const localItem of localOnly) {
          try {
            await apiAddToWishlist(localItem.productId);
          } catch {
            // Silently fail
          }
        }
      } catch (err) {
        console.error('Failed to sync wishlist from backend:', err);
      }
    }

    syncFromBackend();
  }, [user]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.find((item) => item.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          addedAt: new Date().toISOString(),
        },
      ];
    });

    // Sync to backend if authenticated (check localStorage for token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      apiAddToWishlist(product.id).catch((err) => {
        console.error('Failed to add item to backend wishlist:', err);
      });
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      apiRemoveFromWishlist(productId).catch((err) => {
        console.error('Failed to remove item from backend wishlist:', err);
      });
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isInWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};