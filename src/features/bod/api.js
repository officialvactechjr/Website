import { supabase } from '../../lib/supabaseClient'
import { removeImageByUrl } from '../storage/api'

const COLUMNS = 'id, full_name, position, bio, photo_url, term_year, sort_order'

// The BOD table is world-readable (see migration 0004), so no view is needed here.
// The public page and the admin table share this one query and its cache entry.
export async function fetchBodMembers({ limit } = {}) {
  let query = supabase
    .from('bod_members')
    .select(COLUMNS)
    .order('term_year', { ascending: false })
    .order('sort_order')
    .order('full_name')

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createBodMember(values) {
  const { error } = await supabase.from('bod_members').insert(values)
  if (error) throw error
}

export async function updateBodMember({ id, values }) {
  const { error } = await supabase.from('bod_members').update(values).eq('id', id)
  if (error) throw error
}

/** Removes the row, then its photo. The storage step is best effort. */
export async function deleteBodMember({ id, photoUrl }) {
  const { error } = await supabase.from('bod_members').delete().eq('id', id)
  if (error) throw error
  if (photoUrl) await removeImageByUrl(photoUrl)
}
