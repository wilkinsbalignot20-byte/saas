// src/app/explore/layout.tsx
'use client';

import { CartProvider } from "../../context/CartContext"; // 🟢 SINKRONISADO: Relative access patungong context controller

export default function MarketplaceAndShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🛡️ ENCAPSULATION MATRIX: Dito lang magiging aktibo ang CartProvider para sa customers.
    // Ligtas at malinis ang /dashboard at /admin panels mo dahil hindi sila abot ng provider node na ito!
    <CartProvider>
      {children}
    </CartProvider>
  );
}
