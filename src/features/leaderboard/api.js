import { supabase } from '../../lib/supabaseClient'

const COLUMNS = 'full_name, class, total_points'

// The `leaderboard` view already totals the points and sorts them. Reading
// `points_log` directly is not possible for a visitor — by design.
export async function fetchLeaderboard({ limit } = {}) {
  let query = supabase
    .from('leaderboard')
    .select(COLUMNS)
    .order('total_points', { ascending: false })
    .order('full_name')

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data
}
