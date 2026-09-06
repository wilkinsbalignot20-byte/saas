 'use client';

import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function CartSidebar() {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* 🛒 FLOATING CART BUTTON (Nakikitang indicator sa screen) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all z-50 flex items-center space-x-2 active:scale-95"
      >
        <span>🛒</span>
        <span className="font-bold text-sm bg-white text-blue-600 px-2 py-0.5 rounded-full">
          {totalItems}
        </span>
      </button>

      {/* 🪟 THE SIDEBAR OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between text-gray-900 animate-slide-in">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">Shopping Cart 🛍️</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2">✕</button>
            </div>

            {/* Listahan ng Order */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Walang laman ang iyong cart.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">₱{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-blue-600">₱{item.price * item.quantity}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs p-1 hover:underline">Alisin</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Kabuuang Bayarin */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-blue-600">₱{getCartTotal().toLocaleString('en-US')}</span>
              </div>
              
              {cart.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={clearCart} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-xl text-xs transition">
                    Clear Cart
                  </button>
                  <button onClick={() => alert("Proceeding to Checkout...")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs text-center shadow-md transition">
                    Checkout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
