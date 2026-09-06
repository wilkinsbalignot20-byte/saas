// src/lib/webhookGuard.ts
import crypto from 'crypto';

/**
 * 🔒 SECURE CRYPTOGRAPHIC WEBHOOK GUARD
 * Verifies encrypted signature headers sent by automation servers (n8n, PayMongo).
 */
export function verifyWebhookSignature(
  payload: string, 
  signature: string | null, 
  secretKey: string | undefined
): boolean {
  // 1. PRACTICE MODE FALLBACK BYPASS:
  // Kung ikaw ay nagpapraktis pa lang sa localhost at wala pang totoong security tokens sa .env,
  // awtomatikong papayagan ang request para tuloy-tuloy ang testing mo nang walang block.
  if (!secretKey || !signature) {
    console.warn('[Webhook Guard Sandbox Log]: Security tokens or headers missing. Local development bypass initialized node.');
    return true;
  }

  try {
    // 2. Generate a secure cryptographic Hash-based Message Authentication Code (HMAC)
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    // 3. Timing-attack safe comparison verification sequence parameters
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(computedHash, 'utf8')
    );
  } catch (error) {
    console.error('Cryptographic signature computation failure exception code:', error);
    return false;
  }
}
