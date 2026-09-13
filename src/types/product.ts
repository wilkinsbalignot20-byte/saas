 // src/types/product.ts

export interface Product {
  id: string;              // Unique product UUID
  store_id: string;        // UUID ng store kung saan nakatali ang produktong ito (Tenant Isolation)
  name: string;            // Pangalan ng paninda (hal. "Okinawa Milktea")
  price: number;           // Presyo ng produkto (Dapat ay isang numero)
  stock: number;           // Dami ng imbentaryo na natitira
  image_url?: string;      // Opsyonal (may question mark) na link para sa larawan ng produkto
  created_at: string;      // Petsa ng pag-upload
}

// 🟢 GINADAGDAG: Ang bagong "Batas" at Type contract para sa mga product variation nodes
export interface ProductVariant {
  id: string;              // Unique variant UUID matching product_variants table
  product_id: string;      // UUID ng magulang na produkto (Foreign Key Relation)
  variant_name: string;    // Pangalan ng variation (hal. "Large", "Red / XL")
  sku: string | null;      // Sariling SKU link para sa partikular na variant tracking
  price_modifier: number;  // Dagdag na halaga sa base price ng magulang
  stock: number;           // Saktong bilang ng natitirang stock para sa variant na ito
  image_url: string | null;// Opsyonal na hiwalay na larawan para sa variation na ito
  created_at: string;
}

// 🟢 GINADAGDAG: Relational structural map para sa compound data extractions
export interface ProductWithVariants extends Product {
  variants?: ProductVariant[]; // Kalipunan ng mga anak na variant sa ilalim ng produkto
}
