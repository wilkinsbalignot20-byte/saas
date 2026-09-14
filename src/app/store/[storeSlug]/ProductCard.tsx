 // src/app/store/[storeSlug]/ProductCard.tsx
'use client';

import { useCart } from "../../../context/CartContext";
import { useRouter } from "next/navigation"; 
import { ImageOff, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    image_url?: string | null; 
    store_name?: string; // 🟢 GINADAGDAG: Pangalan ng tindahan para sa Lazada-style matrix
  };
  brandColor: string;
}

export default function ProductCard({ product, brandColor }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter(); 

  const handleNavigateToDetailView = () => {
    const cleanProductSlug = product.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 🚀 THE SYSTEM ROADMAP CONNECTION:
    // Idadaong natin ang customer sa malinis na: /(marketplace)/[productSlug]
    router.push(`/${cleanProductSlug}`);
  };

  return (
    <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden hover:border-ink/20 transition-all flex flex-col justify-between p-5 group">
      
      <div onClick={handleNavigateToDetailView} className="cursor-pointer flex-1">
        
        {/* 📸 IMAGE VIEW FRAME */}
        <div className="w-full h-40 bg-ink/[0.03] rounded-xl flex items-center justify-center overflow-hidden border border-ink/5 group-hover:bg-ink/5 transition-colors mb-4 relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <ImageOff size={20} className="text-ink/20" strokeWidth={1.5} />
          )}
        </div>

        {/* 🏪 STORE TAG: Lalabas lang ito kapag nasa malaking Mall homepage ang customer */}
        {product.store_name && (
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">
            {product.store_name}
          </span>
        )}

        <h4 className="font-medium text-sm text-ink line-clamp-1 group-hover:text-ink/80 transition-colors">
          {product.name}
        </h4>
        
        <p className="text-base font-semibold mt-1" style={{ color: brandColor }}>
          ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center text-xs text-ink/40 select-none">
          <span>Availability</span>
          <span className={product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation(); 
            addToCart({ id: product.id, name: product.name, price: Number(product.price) });
          }}
          disabled={product.stock <= 0}
          className="w-full text-white text-sm font-semibold py-3 px-4 rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          style={{ backgroundColor: brandColor }}
        >
          <ShoppingBag size={14} strokeWidth={2} />
          Add to cart
        </button>
      </div>
    </div>
  );
}
