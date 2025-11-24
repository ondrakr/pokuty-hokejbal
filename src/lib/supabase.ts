import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Pro vývoj: raději fail-fast s jasnou chybou než tichý fallback, který vede k "fetch failed".
  throw new Error(
    'Chybí konfigurace Supabase: nastavte NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY (viz env.local)'
  )
}

export const SUPABASE_URL_INFERRED = supabaseUrl
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
