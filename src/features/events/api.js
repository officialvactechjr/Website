import { supabase } from '../../lib/supabaseClient'
import { removeImageByUrl } from '../storage/api'

const COLUMNS = 'id, title, description, location, starts_at, ends_at, cover_image, status'

/** The public lists only show published events, so a draft never appears. */
export async function fetchEvents({ upcoming = true, limit = 50 } = {}) {
  const now = new Date().toISOString()

  const query = supabase.from('events').select(COLUMNS).eq('status', 'published')
  const ordered = upcoming
    ? query.gte('starts_at', now).order('starts_at', { ascending: true })
    : query.lt('starts_at', now).order('starts_at', { ascending: false })

  const { data, error } = await ordered.limit(limit)
  if (error) throw error
  return data
}

/**
 * No status filter on purpose: RLS is the gate. A visitor gets published and
 * cancelled events (so a shared link to a cancelled event still explains
 * itself), and a draft returns nothing at all.
 */
export async function fetchEvent(id) {
  const { data, error } = await supabase.from('events').select(COLUMNS).eq('id', id).single()
  if (error) throw error
  return data
}

const HOME_COLUMNS = 'id, title, description, starts_at, cover_image, status'

/**
 * The Home page's two event lists. Visitors may see published and cancelled
 * events (RLS hides drafts).
 *
 * - `upcoming`: published events starting in the future, soonest first, at most
 *   `upcomingLimit`. A future cancelled event is left to `/events`.
 * - `past`: published or cancelled events whose start has passed, most recent
 *   first, at most `limit`.
 *
 * Two reads because a single order cannot put the future ahead of the past.
 */
export async function fetchHomeEvents({ limit = 12, upcomingLimit = 4 } = {}) {
  const now = new Date().toISOString()

  const [upcoming, past] = await Promise.all([
    supabase
      .from('events')
      .select(HOME_COLUMNS)
      .eq('status', 'published')
      .gte('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(upcomingLimit),
    supabase
      .from('events')
      .select(HOME_COLUMNS)
      .in('status', ['published', 'cancelled'])
      .lt('starts_at', now)
      .order('starts_at', { ascending: false })
      .limit(limit),
  ])
  if (upcoming.error) throw upcoming.error
  if (past.error) throw past.error

  return { upcoming: upcoming.data, past: past.data }
}

/** Staff read every status, drafts included. */
export async function fetchEventsForAdmin({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from('events')
    .select(COLUMNS)
    .order('starts_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function createEvent(values) {
  const { error } = await supabase.from('events').insert(values)
  if (error) throw error
}

export async function updateEvent({ id, values }) {
  const { error } = await supabase.from('events').update(values).eq('id', id)
  if (error) throw error
}

/** Removes the row, then its cover image. The storage step is best effort. */
export async function deleteEvent({ id, coverImage }) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
  if (coverImage) await removeImageByUrl(coverImage)
}
