import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import { tenantOrderAutomation } from "../../inngest/functions";

// IPUBLES: I-serve ang Inngest client kasama ang listahan ng mga functional automated matrix handles
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    tenantOrderAutomation, // Naka-rehistro ang iyong existing order automation worker node
  ],
});
