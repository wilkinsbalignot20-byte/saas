 // src/app/store/[storeSlug]/ProductCard.tsx
'use client';

import { useCart } from "../../../context/CartContext";
import { useRouter } from "next/navigation"; // 🟢 GINADAGDAG: Router engine para sa page transitions
import { ImageOff, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    image_url?: string | null; // 🟢 GINADAGDAG: Isinama para gumana ang dynamic upload visualization node mo
  };
  brandColor: string;
}

export default function ProductCard({ product, brandColor }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter(); // 🟢 INITIALIZATION: Buhayin ang router controller

  // Handler utility para sa automated routing navigation loop patungo kay variantId view
  const handleNavigateToDetailView = () => {
    // I-convert ang pangalan ng produkto para maging malinis at lowercase text string URL parameter slug
    const cleanProductSlug = product.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 🚀 THE SYSTEM ROADMAP CONNECTION:
    // Idadaong natin ang customer sa: /[product]/[productid]/[variantId]
    // Gagamitin natin pansamantala ang product.id bilang default variant configuration token fallback array tracker
    router.push(`/${cleanProductSlug}/${product.id}/${product.id}`);
  };

  return (
    <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden hover:border-ink/20 transition-all flex flex-col justify-between p-5 group">
      
      {/* WRAPPER LAYER: Gawing clickable ang itaas na bahagi ng card para sa page redirect navigation */}
      <div onClick={handleNavigateToDetailView} className="cursor-pointer flex-1">
        
        {/* 📸 DYNAMIC IMAGE VIEW FRAME: Luluwa na nang malinis ang inupload mong photo galing storage block */}
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

        <h4 className="font-medium text-sm text-ink line-clamp-1 group-hover:text-ink/80 transition-colors">
          {product.name}
        </h4>
        
        <p className="text-base font-semibold mt-1" style={{ color: brandColor }}>
          ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
      
      {/* LOWER BASE INTERACTION CONTROLS SHEET (Add to Cart Area) */}
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
            e.stopPropagation(); // 🛡️ CRITICAL SHIELD: Pinipigilan nitong mag-trigger ang page navigation kapag Add to Cart lang ang pinindot!
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