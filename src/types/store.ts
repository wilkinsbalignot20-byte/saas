 // src/types/store.ts

export interface Store {
  id: string;              // Unique UUID mula sa Supabase
  name: string;            // Pangalan ng tindahan (hal. "Milktea Zone Hub")
  slug: string;            // URL extension address (hal. "milktea-zone")
  theme_color: string;     // Hex code para sa disenyo ng header (hal. "#10b981")
  status: 'active' | 'suspended' | 'trial'; // Limitadong pagpipilian para sa kaligtasan ng system
  created_at: string;      // Petsa kung kailan ginawa ang shop
}
