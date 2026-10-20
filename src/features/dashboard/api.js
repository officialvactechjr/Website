import { supabase } from '../../lib/supabaseClient'

/** Counts only: `head: true` asks for the number without sending any rows. */
async function countRows(table, applyFilter) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (applyFilter) query = applyFilter(query)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function fetchDashboard() {
  const [notices, events, gallery, bod, pendingProjects, recentNotices] = await Promise.all([
    countRows('notices'),
    countRows('events'),
    countRows('gallery_photos'),
    countRows('bod_members'),
    countRows('projects', (query) => query.eq('status', 'pending')),
    supabase
      .from('notices')
      .select('id, title, published_at')
      .order('published_at', { ascending: false })
      .limit(5),
  ])

  if (recentNotices.error) throw recentNotices.error

  return {
    counts: { notices, events, gallery, bod, pendingProjects },
    recentNotices: recentNotices.data,
  }
}
