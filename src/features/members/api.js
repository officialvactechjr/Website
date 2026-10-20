import { supabase } from '../../lib/supabaseClient'

const COLUMNS = 'full_name, class, section, github_url, avatar_url'

// Reads the `public_members` view, never `profiles`: the view is the privacy
// boundary and only exposes active members' safe columns.
export async function fetchMembers({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from('public_members')
    .select(COLUMNS)
    .order('full_name')
    .limit(limit)

  if (error) throw error
  return data
}
