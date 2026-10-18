import { supabase } from '../../lib/supabaseClient'

/** Settings are key/value rows; the page just needs a flat lookup. */
export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
}
