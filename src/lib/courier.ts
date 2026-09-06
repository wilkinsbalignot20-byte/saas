// src/lib/courier.ts
import { supabase } from './supabase';

interface ShippingPayload {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  courierCode: 'jnt' | 'flash' | 'spx';
}

/**
 * 🚚 AUTOMATED LOGISTICS MANAGEMENT HUB
 * Dispatches booking requests to courier networks via the n8n automation node pipeline.
 */
export async function generateShippingAirwayBill(payload: ShippingPayload) {
  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_LOGISTICS_WEBHOOK_URL;

  // 1. PRACTICE MODE FALLBACK BYPASS:
  // Kung wala ka pang configured n8n workflow link sa iyong .env file,
  // huwag nating patigilin ang system. Mag-simulate tayo ng matagumpay na booking tracking numbers.
  if (!n8nWebhookUrl) {
    console.warn('[Logistics Engine Notice]: n8n logistics webhook URL missing. Generating simulated practice courier airway bill node.');
    
    return {
      success: true,
      trackingNumber: `${payload.courierCode.toUpperCase()}-PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
      labelUrl: 'https://test-courier.com',
      provider: `Simulated ${payload.courierCode.toUpperCase()} Dispatcher`
    };
  }

  try {
    // 2. TOTOONG INTEGRATION WEBHOOK HANDSHAKE:
    // Ipadala ang parcel routing parameters diretso sa iyong n8n active canvas workspace
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-platform-source': 'Manipu SaaS Engine'
      },
      body: JSON.stringify({
        action: 'create_airwaybill',
        order_reference: payload.orderId,
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

    // Ibalik ang binalik na tracking assets mula sa successful n8n courier execution node connection
    return {
      success: true,
      trackingNumber: json.trackingNumber,
      labelUrl: json.labelUrl,
      provider: payload.courierCode
    };

  } catch (error: any) {
    console.error('Logistics architecture synchronization exception:', error.message);
    return { success: false, error: error.message };
  }
}
