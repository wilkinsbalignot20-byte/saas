'use client';

import React, { useState } from 'react';
import { Search, ArrowUpDown, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

// Mock Inventory Data base sa structures ng iyong products tree
const MOCK_INVENTORY = [
  { id: '1', sku: 'MNP-TSH-BLK-M', name: 'Classic Minimalist Tee', variant: 'Black / M', stock: 12, price: 499.00, status: 'In Stock' },
  { id: '2', sku: 'MNP-TSH-WHT-L', name: 'Classic Minimalist Tee', variant: 'White / L', stock: 3, price: 499.00, status: 'Low Stock' },
  { id: '3', sku: 'MNP-HD-GRY-XL', name: 'Oversized Heavyweight Hoodie', variant: 'Heather Gray / XL', stock: 0, price: 1299.00, status: 'Out of Stock' },
  { id: '4', sku: 'MNP-CP-NVY-OS', name: 'Dad Hat Embroidery', variant: 'Navy / OS', stock: 45, price: 350.00, status: 'In Stock' },
  { id: '5', sku: 'MNP-TOTE-CRM-OS', name: 'Canvas Tote Bag Large', variant: 'Cream / OS', stock: 2, price: 280.00, status: 'Low Stock' },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryList, setInventoryList] = useState(MOCK_INVENTORY);

  // Function para sa inline stock numeric editor helper
  const handleStockChange = (id: string, newValue: number) => {
    setInventoryList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updatedStock = Math.max(0, newValue);
          let updatedStatus = 'In Stock';
          if (updatedStock === 0) updatedStatus = 'Out of Stock';
          else if (updatedStock <= 5) updatedStatus = 'Low Stock';
          
          return { ...item, stock: updatedStock, status: updatedStatus };
        }
        return item;
      })
    );
  };

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Inventory Stock</h1>
          <p className="text-sm text-ink/50 mt-1">Audit and update your variant stock levels across your catalog.</p>
        </div>
        <button className="flex items-center justify-center gap-2 self-start bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-ink/90 transition-colors">
          <RefreshCw size={14} />
          <span>Save Changes</span>
        </button>
      </header>

      {/* FILTER & SEARCH BAR TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-ink/10 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-ink/40"
          />
        </div>
      </div>

      {/* INVENTORY SHEET / TABLE */}
      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-ink/5 text-xs font-semibold text-ink/50 tracking-wider">
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6 text-center w-36">Available Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 text-xs">
              {inventoryList
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* SKU */}
                    <td className="py-4 px-6 font-mono font-medium text-ink/60">{item.sku}</td>
                    
                    {/* Product Name & Variant Spec */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ink text-sm">{item.name}</p>
                      <p className="text-ink/40 text-[11px] mt-0.5">{item.variant}</p>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-[10px] tracking-wide ${
                        item.status === 'In Stock' ? 'bg-teal/10 text-teal' :
                        item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status === 'In Stock' && <ShieldCheck size={12} />}
                        {item.status !== 'In Stock' && <AlertCircle size={12} />}
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Price Tag */}
                    <td className="py-4 px-6 text-right font-medium text-ink/80">
                      ₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    
                    {/* Quantitative Input Auditor */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center border border-ink/10 rounded-xl bg-gray-50 overflow-hidden w-28 mx-auto">
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, item.stock - 1)}
                          className="px-3 py-2 text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors font-bold text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-full text-center bg-transparent text-xs font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.id, item.stock + 1)}
                          className="px-3 py-2 text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
