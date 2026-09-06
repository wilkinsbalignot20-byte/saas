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
