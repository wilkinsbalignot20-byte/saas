 // ==========================================
// 📦 LABEL: AUTOMATION SYSTEM TYPES DEFINITIONS
// LOCATION: /src/types/automation.ts
// PURPOSE: Sinisiguro ng file na ito na may mahigpit at ligtas na kontrata ang mga data structure
//          ng iyong multi-tenant background execution engine at merchant configurations.
// ==========================================

export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';
export type AutomationStatus = 'success' | 'failed' | 'retrying' | 'skipped';
export type MarketingTheme = 'minimalist' | 'modern' | 'bold';

/**
 * Konpigurasyon ng automation features na naka-save sa database para sa bawat merchant.
 */
export interface TenantAutomationConfig {
  tenant_id: string;
  is_enabled: boolean;
  selected_marketing_theme: MarketingTheme;
  primary_brand_color: string; // Light background style hex string (e.g., #f3f4f6)
  whatsapp_receipt_enabled: boolean;
  slack_alert_enabled: boolean;
}

/**
 * Istraktura ng bawat transaction log kapag tumatakbo ang automation jobs.
 * Gagamitin ito para ipakita ang live activity sa Seller Dashboard.
 */
export interface AutomationLog {
  id: string;
  tenant_id: string;
  event_name: string; // e.g., 'shop/order.created', 'marketing/voucher.activated'
  status: AutomationStatus;
  error_message?: string;
  execution_duration_ms: number;
  executed_at: string;
}

/**
 * Payload interface para sa bawat event na ipinapasa mula sa iyong Next.js route/actions papuntang Inngest.
 */
export interface InngestEventPayload {
  name: string;
  data: {
    tenantId: string;
    storeSlug: string;
    [key: string]: any; // Dito papasok ang flexible dynamic elements ng orders, vouchers, o chat logs
  };
}
