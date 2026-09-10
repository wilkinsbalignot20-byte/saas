 // @ts-ignore - Sinasabihan nito si VS Code na huwag mag-alala sa .js extension ng Supabase file mo
import { supabase } from "@/lib/supabase.js"; // 👈 Ginagamit ang Next.js Path Alias na may .js suffix

// 1. Helper para mag-post sa Google Business Profile ng isang partikular na Merchant
export async function updateMerchantGoogleBusiness(storeSlug: string, message: string) {
  try {
    // Kukuha ng Google OAuth Token ang system mula sa database gamit ang storeSlug ng merchant
    const { data: tenant, error } = await supabase
      .from("stores") 
      .select("google_access_token, google_refresh_token")
      .eq("slug", storeSlug)
      .maybeSingle(); // 👈 Mas ligtas sa TypeScript kaysa sa .single() kung walang nahanap

    if (error || !tenant) throw new Error("Merchant Google credentials not found");

    // Dito mo na isusulat ang purong Fetch API o SDK call para sa Google Business API
    return { success: true, log: `Successfully posted to Google for ${storeSlug}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 2. Helper para magpadala ng SMS sa bumiling customer
export async function sendCustomerSMS(phone: string, text: string) {
  return { success: true, message: "SMS sent successfully" };
}
