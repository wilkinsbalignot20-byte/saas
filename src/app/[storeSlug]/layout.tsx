 'use client';

import React from 'react';
import { CartProvider } from '../../context/CartContext';
import CartSidebar from '../../components/CartSidebar'; // Inimport dito para sa kustomer lang!

export default function CustomerStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      
      {/* Lalabas at lilipad na lamang ito eksklusibo sa harap ng tindahan ng kustomer */}
      <CartSidebar />
    </CartProvider>
  );
}
