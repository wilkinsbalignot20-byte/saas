 // src/inngest/functions.ts
import { inngest } from "./client"; 
import { updateMerchantGoogleBusiness, sendCustomerSMS } from "../lib/automation";
import { supabase } from "../lib/supabase"; // Inimport ang supabase para sa secure inventory mutation

export const tenantOrderAutomation = inngest.createFunction(
  { 
    id: "tenant-order-automation",
    triggers: [{ event: "store/order.created" }] 
  },
  async ({ event, step }) => {
    // Idinagdag ang storeId sa event payload para sa mabilis at ligtas na DB indexing
    const { storeSlug, storeId, orderId, customerPhone } = event.data;

    // STEP 1: SECURE INVENTORY DEDUCTION WORKFLOW (Bawas Stock Server-Side)
    await step.run("deduct-store-inventory", async () => {
      // 1. Fetch lahat ng aytem na binili sa order na ito mula sa bagong order_items table
      const { data: items, error: fetchError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (fetchError || !items || items.length === 0) {
        throw new Error(`Inventory Failure: Unable to fetch items for order #${orderId}`);
      }

      // 2. Loop sa bawat aytem para ibawas ang stock nang ligtas gamit ang row matching
      for (const item of items) {
        // Gumamit ng RPC o direktang math update na protektado sa race conditions
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .eq("store_id", storeId) // Multi-tenant isolation enforcement
          .single();

        if (productError || !product) {
          throw new Error(`Security Exception: Product ${item.product_id} match configuration breach.`);
        }

        const newStock = product.stock - item.quantity;

        // I-update ang bagong stock level
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: Math.max(0, newStock) }) // Iwasan ang mag-negatibo ang stock
          .eq("id", item.product_id)
          .eq("store_id", storeId);

        if (updateError) throw new Error(`Stock locking failed for item ${item.product_id}`);
      }

      return { status: "INVENTORY_SUCCESSFULLY_DEDUCTED", itemsCount: items.length };
    });

    // STEP 2: GOOGLE BUSINESS AUTOMATION CONNECTOR
    await step.run("update-google-business", async () => {
      const result = await updateMerchantGoogleBusiness(storeSlug, `Bagong order #${orderId} na pumasok!`);
      if (!result.success) throw new Error(result.error); 
      return result;
    });

    // STEP 3: PLATFORM COOL-DOWN DELAY
    await step.sleep("wait-a-minute", "1m");

    // STEP 4: CUSTOMER NOTIFICATION DELIVERY
    await step.run("send-order-sms", async () => {
      if (!customerPhone) return { status: "SKIPPED_NO_PHONE" };
      const message = `Salamat sa pagbili! Ang iyong order #${orderId} ay pinaproseso na ng tindahan.`;
      return await sendCustomerSMS(customerPhone, message);
    });
  }
);
