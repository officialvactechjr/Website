import { supabase } from '../../lib/supabaseClient'

/** Settings are key/value rows; the page just needs a flat lookup. */
export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
}

/**
 * PUBLIC values only. The table is readable by every visitor, so an admin screen
 * must never put a key, a password or a personal email address in it.
 */
export async function saveSetting({ key, value }) {
  const { error } = await supabase.from('settings').upsert({ key, value })
  if (error) throw error
}

export async function deleteSetting(key) {
  const { error } = await supabase.from('settings').delete().eq('key', key)
  if (error) throw error
}
