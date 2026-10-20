import { supabase } from '../../lib/supabaseClient'
import { removeImageByUrl } from '../storage/api'

// The embedded `events` row is what the /gallery event filter is built from, so
// the whole grid loads in one request. The public page and the admin table share
// this query and its cache entry.
const COLUMNS =
  'id, title, caption, image_url, taken_on, event_id, sort_order, events ( id, title )'

export async function fetchGalleryPhotos({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select(COLUMNS)
    .order('taken_on', { ascending: false, nullsFirst: false })
    .order('sort_order')
    .limit(limit)

  if (error) throw error
  return data
}

/** Multi-upload inserts one row per photo. */
export async function createGalleryPhotos(rows) {
  const { error } = await supabase.from('gallery_photos').insert(rows)
  if (error) throw error
}

/** Removes the row, then its file. The storage step is best effort. */
export async function deleteGalleryPhoto({ id, imageUrl }) {
  const { error } = await supabase.from('gallery_photos').delete().eq('id', id)
  if (error) throw error
  if (imageUrl) await removeImageByUrl(imageUrl)
}
