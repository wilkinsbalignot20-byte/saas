 // src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}

// Gumagamit na ngayon ng Browser Client na may automatic Cookie Syncing capabilities
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey // Siguraduhing ilalagay mo ang role key mo sa .env
)
