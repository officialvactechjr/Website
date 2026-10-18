import { supabase } from '../../lib/supabaseClient'

const LIST_COLUMNS = 'id, title, is_pinned, published_at'

// RLS decides what is readable: only notices whose published_at has passed, plus
// everything for staff.
export async function fetchNotices({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('notices')
    .select(LIST_COLUMNS)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function fetchNotice(id) {
  const { data, error } = await supabase
    .from('notices')
    .select(`${LIST_COLUMNS}, body`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
