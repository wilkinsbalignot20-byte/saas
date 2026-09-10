 import { Inngest, eventType, staticSchema } from "inngest";

// 1. I-define ang eksaktong structure ng data payload para sa iyong order event
type OrderCreatedPayload = {
  storeSlug: string;
  orderId: string;
  customerPhone: string;
};

// 2. Gamitin ang eventType helper kasama ang staticSchema para i-rehistro ang event mo
export const orderCreatedEvent = eventType("store/order.created", {
  schema: staticSchema<OrderCreatedPayload>(),
});

// 3. I-initialize ang Inngest client (wala nang "schemas" property rito)
export const inngest = new Inngest({ 
  id: "wilkins-saas",
});
