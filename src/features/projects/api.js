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

// ---------------------------------------------------------------------------
// Staff review (ADM-07). `staff_projects` is a role-gated view, so this returns
// nothing for anyone who is not staff.
// ---------------------------------------------------------------------------
export async function fetchReviewQueue({ status = 'pending' } = {}) {
  const { data, error } = await supabase
    .from('staff_projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/** Rejecting requires a reason; the database refuses an empty one. */
export async function decideProject({ id, status, reviewNote, reviewedBy }) {
  const { error } = await supabase
    .from('projects')
    .update({
      status,
      review_note: reviewNote ?? null,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// A member's own projects (MEM-03, 04, 05). RLS keeps every call here to rows
// they own, and the database clears the review columns on their behalf: an edit
// always goes back to `pending`, whatever the client sends.
// ---------------------------------------------------------------------------
const OWN_COLUMNS =
  'id, title, description, image_url, github_url, status, review_note, created_at, updated_at'

export async function fetchMyProjects(ownerId) {
  const { data, error } = await supabase
    .from('projects')
    .select(OWN_COLUMNS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchMyProject(id) {
  const { data, error } = await supabase.from('projects').select(OWN_COLUMNS).eq('id', id).single()

  if (error) throw error
  return data
}

export async function createProject({ ownerId, title, description, imageUrl, githubUrl }) {
  const { error } = await supabase.from('projects').insert({
    owner_id: ownerId,
    title,
    description,
    image_url: imageUrl || null,
    github_url: githubUrl || null,
  })

  if (error) throw error
}

export async function updateProject({ id, title, description, imageUrl, githubUrl }) {
  const { error } = await supabase
    .from('projects')
    .update({
      title,
      description,
      image_url: imageUrl || null,
      github_url: githubUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
