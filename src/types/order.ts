export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  shipping_fee: number;
  status: OrderStatus;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  tracking_number: string | null;
  courier_name: string | null;
  store_id: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

// Para sa pagpasa ng data mula sa Frontstore Checkout patungong Backend
export interface CreateOrderPayload {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  buyer_region: 'METRO_MANILA' | 'LUZON' | 'VISAYAS_MINDANAO';
  items: {
    product_id: string;
    quantity: number;
  }[];
}
