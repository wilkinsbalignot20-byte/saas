 // src/app/[storeSlug]/ProductCard.tsx
'use client';

import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  brandColor: string;
}

export default function ProductCard({ product, brandColor }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 group">
      <div>
        {/* Placeholder Box para sa Larawan ng Produkto */}
        <div className="w-full h-40 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-4 font-mono text-[10px] border border-gray-100 group-hover:bg-gray-100/50 transition-colors">
          📷 NO IMAGE AVAILABLE
        </div>
        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{product.name}</h4>
        <p className="text-base font-black mt-1 font-mono" style={{ color: brandColor }}>
          ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <span>Availability:</span>
          <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
            {product.stock > 0 ? `${product.stock} Units Left` : 'Out of stock'}
          </span>
        </div>
        
        <button 
          onClick={() => addToCart({ id: product.id, name: product.name, price: Number(product.price) })}
          disabled={product.stock <= 0}
          className="w-full text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider text-center"
          style={{ backgroundColor: brandColor }}
        >
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
}
