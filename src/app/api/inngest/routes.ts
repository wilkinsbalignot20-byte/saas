import { serve } from "inngest/next"; // 👈 'serve' na ang opisyal na gamit sa v4, hindi 'createRouteHandler'
import { inngest } from "../../../inngest/client";
import { tenantOrderAutomation } from "../../../inngest/function";

// Inngest v4: Gagamitin ang serve() adapter para i-expose ang routes
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    tenantOrderAutomation,
  ],
});

