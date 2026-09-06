 // src/context/CartContext.tsx
'use client'; // OBLIGADO: Ang Cart ay nangangailangan ng user interaction (React hooks)

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. I-define ang itsura ng isang item sa loob ng cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 2. Isaksak ang Add to Cart engine
  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCart((prevCart) => {
      // Tingnan kung nandoon na ang produkto sa cart
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Kung nandoon na, dagdagan lang ng 1 ang quantity
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Kung bago ang produkto, itabi ito bilang bagong item
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // 3. Tanggalin ang item sa cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  // 4. Kwentahin ang kabuuang halaga ng mga order
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook para madaling tawagin sa kahit aling page ng tindahan
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
