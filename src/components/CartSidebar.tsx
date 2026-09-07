 // src/components/CartSidebar.tsx
'use client';

import { X, ShoppingBag, Trash2 } from 'lucide-react';
// INAYOS: Kumukuha na sa tamang custom hook ng iyong context file layout tree node
import { useCart } from '../context/CartContext'; 

interface CartSidebarProps {
  // Dahil walang isOpen/setIsOpen sa iyong Context, ipapasa natin ang control loop property
  // na ito mula sa parent frame layout tree nodes
  onClose?: () => void;
}

export default function CartSidebar({ onClose }: CartSidebarProps) {
  // INAYOS: Ginamit ang saktong kontrata ng iyong CartContext.tsx ('cart' at 'getCartTotal')
  const { cart, removeFromCart, getCartTotal } = useCart();

  const totalAmount = getCartTotal();

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-body antialiased animate-in fade-in duration-200">
      {/* Backdrop overlay window panel shadow filter */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-xs cursor-pointer"
      />

      {/* Main Sidebar slide-out sheet */}
      <aside className="relative w-full max-w-md h-full bg-paper border-l border-ink/10 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header toolbar console */}
        <div className="p-5 border-b border-ink/5 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-marigold" />
            <h2 className="font-display font-bold text-lg text-ink">Shopping Bag</h2>
            <span className="bg-ink/5 text-ink text-xs font-semibold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ink/5 rounded-full text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {/* Dynamic Cart Items list content logging viewport */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
              <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center text-ink/30 text-xl">
                🛒
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Your bag is empty</p>
                <p className="text-xs text-ink/40 mt-0.5">Items you add will appear here.</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-3 bg-white border border-ink/5 rounded-xl shadow-xs">
                {/* Fallback space o placeholder kung walang nakuhang custom item link field data model */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-ink/5 shrink-0 flex items-center justify-center text-lg shadow-inner">
                  📦
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-ink truncate">{item.name}</h4>
                  <p className="text-[11px] text-ink/40 font-mono">Qty: {item.quantity}</p>
                  <p className="text-xs font-semibold text-ink">
                    ₱{Number(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 hover:bg-coral/10 text-ink/30 hover:text-coral rounded-lg transition-colors cursor-pointer self-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Action calculations submission processing footer nodes */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-t-ink/10 space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink/50">Subtotal Amount</span>
              <span className="font-display font-bold text-lg text-ink">
                ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <button 
              className="w-full bg-ink hover:bg-ink/90 text-paper font-semibold py-3.5 rounded-full text-xs shadow-md transition transform active:scale-95 text-center block cursor-pointer"
            >
              Proceed to Secure Checkout
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}
