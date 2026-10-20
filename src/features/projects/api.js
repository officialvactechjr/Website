import { supabase } from '../../lib/supabaseClient'

const COLUMNS =
  'id, title, description, image_url, github_url, created_at, owner_name, owner_class, owner_section, owner_github'

// Reads the `public_projects` view, so only approved projects can ever come back
// — the filter lives in the view, not here.
export async function fetchProjects({ limit } = {}) {
  let query = supabase
    .from('public_projects')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchProject(id) {
  const { data, error } = await supabase
    .from('public_projects')
    .select(COLUMNS)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
