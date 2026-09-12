 import { inngest } from "./client"; // INAYOS: Tinanggal ang orderCreatedEvent import dahil hindi na ito kailangan sa v4
import { updateMerchantGoogleBusiness, sendCustomerSMS } from "../lib/automation";

export const tenantOrderAutomation = inngest.createFunction(
  { 
    id: "tenant-order-automation",
    // UPGRADE: Ginamit ang opisyal na v4 trigger format gamit ang event string identifier key
    triggers: [{ event: "store/order.created" }] 
  },
  async ({ event, step }) => {
    const { storeSlug, orderId, customerPhone } = event.data;

    // Step 1: Tatawagin ang iyong lib helper para sa Google
    await step.run("update-google-business", async () => {
      const result = await updateMerchantGoogleBusiness(storeSlug, `Bagong order #${orderId} na pumasok!`);
      if (!result.success) throw new Error(result.error); 
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
