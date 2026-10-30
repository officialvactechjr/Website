import { supabase } from '../../lib/supabaseClient'

/**
 * Home's totals: active members, approved projects, published-and-finished
 * events. One row, three counts, no personal data — every filter lives inside
 * the `public_site_stats` view (migration 0012), so a caller cannot widen it.
 *
 * `single()` on purpose: the view is defined to return exactly one row, so no
 * row (or no view, before `0012` is applied) is a real error. Callers turn that
 * into a dash rather than a zero.
 */
export async function fetchSiteStats() {
  const { data, error } = await supabase.from('public_site_stats').select('*').single()
  if (error) throw error
  return data
}
