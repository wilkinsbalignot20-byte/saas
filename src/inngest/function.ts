 import { inngest, orderCreatedEvent } from "./client";
import { updateMerchantGoogleBusiness, sendCustomerSMS } from "../lib/automation"; // 👈 I-import dito!

export const tenantOrderAutomation = inngest.createFunction(
  { 
    id: "tenant-order-automation",
    triggers: [orderCreatedEvent]
  },
  async ({ event, step }) => {
    const { storeSlug, orderId, customerPhone } = event.data;

    // Step 1: Tatawagin ang iyong lib helper para sa Google
    await step.run("update-google-business", async () => {
      const result = await updateMerchantGoogleBusiness(storeSlug, `Bagong order #${orderId} na pumasok!`);
      if (!result.success) throw new Error(result.error); // Pag nag-error, mag-o-auto-retry si Inngest!
      return result;
    });

    // Step 2: Maghintay ng 1 minuto
    await step.sleep("wait-a-minute", "1m");

    // Step 3: Tatawagin ang iyong lib helper para sa SMS
    await step.run("send-order-sms", async () => {
      const message = `Salamat sa pagbili! Ang iyong order #${orderId} ay pinaproseso na ng tindahan.`;
      return await sendCustomerSMS(customerPhone, message);
    });
  }
);
