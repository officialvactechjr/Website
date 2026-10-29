import { supabase } from '../../lib/supabaseClient'

const STAFF_COLUMNS = 'id, message, is_read, read_at, created_at'

/**
 * Staff read the sanitized view. `author_id` is not a column of it, and the base
 * table refuses that column to every client role — the box stays anonymous.
 */
export async function fetchSuggestions({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from('staff_suggestions')
    .select(STAFF_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/** Members may insert and may never read back: no `.select()` after the insert. */
export async function sendSuggestion({ authorId, message }) {
  const { error } = await supabase.from('suggestions').insert({ author_id: authorId, message })
  if (error) throw error
}

/** The database trigger stamps `read_at`; only `is_read` may be sent. */
export async function setSuggestionRead({ id, isRead }) {
  const { error } = await supabase.from('suggestions').update({ is_read: isRead }).eq('id', id)
  if (error) throw error
}
