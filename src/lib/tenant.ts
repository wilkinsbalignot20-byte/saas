 // src/lib/tenant.ts
import { supabase } from './supabase';

// 1. I-define ang structure ng data na ibabalik ng database para sa isang tindahan
export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  theme_color: string;
  status: string;
}

/**
 * Kukuha ng mga detalye at configuration ng isang tindahan mula sa Supabase base sa slug nito.
 * @param slug - Ang natatanging ID ng tindahan sa URL (halimbawa: 'kape-ni-juan')
 */
export async function getStoreBySlug(slug: string): Promise<StoreConfig | null> {
  try {
    // Siguraduhing may slug na ipinasa bago mag-query sa database
    if (!slug) return null;

    // 2. Kausapin ang Supabase: Pumili ng records mula sa 'stores' table
    // kung saan ang column na 'slug' ay katapat ng hinahanap nating pangalan.
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, slug, theme_color, status')
      .eq('slug', slug)
      .eq('status', 'active') // Siguraduhing active ang tindahan (hindi block o sarado)
      .maybeSingle(); // Isang row lang ang dapat ibalik o kaya ay null kung walang nahanap

    if (error) {
      console.error('Database error habang hinahanap ang tenant:', error.message);
      return null;
    }

    // Ibabalik ang data ng tindahan (o null kung hindi nag-eexist sa database)
    return data as StoreConfig | null;
  } catch (err) {
    console.error('Unexpected error sa tenant resolution:', err);
    return null;
  }
}
