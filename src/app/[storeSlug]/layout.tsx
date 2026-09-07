 // src/app/[storeSlug]/layout.tsx
'use client';

import React, { useState } from 'react';
import { CartProvider } from '../../context/CartContext';
import CartSidebar from '../../components/CartSidebar'; // Inimport dito para sa kustomer lang!

export default function CustomerStorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // BAGONG DAGDAG: Lokal na state controller upang pamahalaan ang paglipad ng cart summary dashboard
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartProvider>
      {/* 
        TANDAAN: Kung gusto mong magbukas ang cart tuwing may nagki-click ng "Add to Cart" button 
        sa iyong `ProductCard.tsx`, maaari nating i-export o i-trigger ang trigger loop na ito.
        Sa ngayon, iseset muna natin ito bilang opsyonal na overlay configuration handle nodes.
      */}
      {children}
      
      {/* INAYOS: Magpapakita lamang ang sidebar kung ang active local state configuration key ay true */}
      {isCartOpen && (
        <CartSidebar onClose={() => setIsCartOpen(false)} />
      )}
    </CartProvider>
  );
}
