'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { CartContextType, Product, CartItem, ServerCartItem } from '@/types';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem, clearCart as apiClearCart, mergeCartItems } from '@/lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | null>(null);

const FALL_PICO_PRICE = 450;
const FREE_SHIPPING_THRESHOLD = 5000;
const STANDARD_SHIPPING_COST = 99;

function getGstRate(basePrice: number, servicePrice: number, isHandloom: boolean): number {
  const totalValue = basePrice + servicePrice;
  let gstRate = 5;

  if (servicePrice > 0) {
    if (totalValue > 2500) {
      gstRate = 18;
    } else if (totalValue > 1000) {
      gstRate = 12;
    }
  } else if (!isHandloom && totalValue > 1000) {
    gstRate = 12;
  }

  return gstRate;
}

function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

function generateId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(items));
}

function mapServerItemToClient(item: ServerCartItem): CartItem {
  return {
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.images?.[0] || '',
    quantity: item.quantity,
    fallPico: item.fallPico,
    fallPicoPrice: item.fallPicoPrice,
    isHandloom: item.product.isHandloom,
    itemTotal: item.itemTotal,
  };
}

function mapClientToServerItem(item: CartItem) {
  return {
    productId: item.productId,
    quantity: item.quantity,
    fallPico: item.fallPico,
  };
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(getCartFromStorage);
  const [shippingCost, setShippingCost] = useState(0);
  const syncAttempted = useRef(false);

  useEffect(() => {
    if (!user) {
      syncAttempted.current = false;
      return;
    }
    if (syncAttempted.current) return;
    syncAttempted.current = true;

    const syncCart = async () => {
      const localItems = getCartFromStorage();

      if (localItems.length > 0) {
        try {
          const serverItems = localItems.map(mapClientToServerItem);
          const response = await mergeCartItems(serverItems);
          setItems(response.items.map(mapServerItemToClient));
          setShippingCost(response.shippingCost);
          localStorage.removeItem('cart');
          return;
        } catch {
          console.warn('Failed to merge cart with server');
        }
      }

      try {
        const response = await getCart();
        setItems(response.items.map(mapServerItemToClient));
        setShippingCost(response.shippingCost);
      } catch {
        setItems(localItems);
      }
    };

    syncCart();
  }, [user]);

  useEffect(() => {
    if (!user) {
      saveCartToStorage(items);
    }
  }, [items, user]);

  const callApi = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    if (!user) return null;
    try {
      return await fn();
    } catch (err) {
      console.error('Cart API error:', err);
      return null;
    }
  }, [user]);

  const addItem = useCallback((product: Product, quantity = 1, fallPico = false) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.fallPico === fallPico
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: generateId(),
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
          fallPico,
          fallPicoPrice: fallPico ? FALL_PICO_PRICE : 0,
          isHandloom: product.isHandloom ?? true,
        },
      ];
    });

    if (user) {
      callApi(() => apiAddToCart(product.id, quantity, fallPico));
    }
  }, [user, callApi]);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));

    if (user) {
      callApi(() => removeCartItem(cartItemId));
    }
  }, [user, callApi]);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );

    if (user) {
      callApi(() => updateCartItem(cartItemId, quantity));
    }
  }, [user, callApi, removeItem]);

  const toggleFallPico = useCallback((cartItemId: string, enabled: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              fallPico: enabled,
              fallPicoPrice: enabled ? FALL_PICO_PRICE : 0,
            }
          : item
      )
    );

    if (user) {
      callApi(() => updateCartItem(cartItemId, undefined, enabled));
    }
  }, [user, callApi]);

  const clearCart = useCallback(() => {
    setItems([]);

    if (user) {
      callApi(() => apiClearCart());
    }
  }, [user, callApi]);

  const syncCart = useCallback(async () => {
    if (!user) return;
    const localItems = getCartFromStorage();
    if (localItems.length > 0) {
      try {
        const serverItems = localItems.map(mapClientToServerItem);
        const response = await mergeCartItems(serverItems);
        setItems(response.items.map(mapServerItemToClient));
        setShippingCost(response.shippingCost);
        localStorage.removeItem('cart');
      } catch {
        console.warn('Failed to sync cart');
      }
    }
  }, [user]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price + item.fallPicoPrice) * item.quantity,
    0
  );

  const gst = items.reduce((sum, item) => {
    const rate = getGstRate(item.price, item.fallPicoPrice, item.isHandloom ?? true);
    return sum + ((item.price + item.fallPicoPrice) * item.quantity * rate) / 100;
  }, 0);

  const effectiveShipping = user ? shippingCost : getShippingCost(subtotal);
  const total = subtotal + gst + effectiveShipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        toggleFallPico,
        clearCart,
        syncCart,
        itemCount,
        subtotal,
        gst,
        shippingCost: effectiveShipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
