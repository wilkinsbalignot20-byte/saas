 // src/lib/courier.ts
import { supabase } from './supabase';

interface ShippingPayload {
  orderId: string;
  storeId: string; // Idinagdag para sa Multi-tenant Security Isolation
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  courierCode: 'jnt' | 'flash' | 'spx';
}

/**
 * 🚚 AUTOMATED LOGISTICS MANAGEMENT HUB
 * Dispatches booking requests to courier networks via the n8n automation node pipeline
 * and locks the generated tracking asset into the Supabase database ledger.
 */
export async function generateShippingAirwayBill(payload: ShippingPayload) {
  // SECURITY UPDATE: Inalis ang NEXT_PUBLIC_ para hindi ma-leak ang link sa browser client.
  // Siguraduhing sa iyong .env.local ang pangalan na ay: N8N_LOGISTICS_WEBHOOK_URL
  const n8nWebhookUrl = process.env.N8N_LOGISTICS_WEBHOOK_URL;

  let trackingNumber = '';
  let courierProvider = payload.courierCode.toUpperCase();

  // 1. PRACTICE MODE FALLBACK BYPASS (100% LIBRE, WALANG OPERASYON SA COURIER)
  if (!n8nWebhookUrl) {
    console.warn('[Logistics Engine Notice]: n8n logistics webhook URL missing. Generating simulated practice courier airway bill node.');
    
    // Simulation engine updates
    trackingNumber = `${payload.courierCode.toUpperCase()}-PH-${Math.floor(100000000 + Math.random() * 900000000)}`;
    courierProvider = `Simulated ${payload.courierCode.toUpperCase()} Dispatcher`;
  } else {
    // 2. TOTOONG INTEGRATION WEBHOOK HANDSHAKE (Kung may n8n ka na sa hinaharap)
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-platform-source': 'Manipu SaaS Engine'
        },
        body: JSON.stringify({
          action: 'create_airwaybill',
          order_reference: payload.orderId,
          store_reference: payload.storeId,
          recipient: {
            name: payload.customerName,
            phone: payload.phoneNumber,
            address: payload.deliveryAddress
          },
          carrier: payload.courierCode
        })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || 'Failed to sync shipping manifests to automation server.');
      }

      trackingNumber = json.trackingNumber;
      courierProvider = payload.courierCode;

    } catch (error: any) {
      console.error('Logistics architecture synchronization exception:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 3. SECURE BACKEND WORKFLOW: I-save ang tracking number diretso sa database
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        courier_name: courierProvider,
        status: 'shipped', // Awtomatikong binago ang status ng order patungong shipped
      })
      .eq('id', payload.orderId)
      .eq('store_id', payload.storeId) // STRICT SECURITY: Sisiguraduhing sa saktong tindahan ito ihuhulog
      .select();

    if (error) {
      throw new Error(`Database record locking failed: ${error.message}`);
    }

    return {
      success: true,
      trackingNumber: trackingNumber,
      provider: courierProvider,
      dbSync: 'SUCCESSFULLY_LOCKED'
    };

  } catch (dbError: any) {
    console.error('CRITICAL_DATABASE_LOGISTICS_LATCH_ERROR:', dbError.message);
    return { success: false, error: `Tracking generated (${trackingNumber}) but database sync failed.` };
  }
}
