import { Inngest } from "inngest";
import { Product } from "../types/product";

// 1. EVENT PAYLOAD DEFINITIONS (Strict Schema Mapping)
type OrderCreatedPayload = {
  name: "store/order.created";
  data: {
    storeSlug: string;
    orderId: string;
    customerPhone: string;
  };
};

type ProductCreatedPayload = {
  name: "shop/product.created";
  data: {
    productId: string;
    storeId: string;
    sku: string | null;
    price: number;
  };
};

// 2. INITIALIZE THE CORE INNGEST ENGINE WITH V4 SCHEMAS SPECIFICATION
export const inngest = new Inngest({
  id: "wilkins-saas", // Naka-konekta sa iyong project naming hub
  schemas: {
    // Pinag-isang schema block para sa matatag na validation matrix
    "store/order.created": {
      data: {} as OrderCreatedPayload["data"],
    },
    "shop/product.created": {
      data: {} as ProductCreatedPayload["data"],
    },
  },
});
