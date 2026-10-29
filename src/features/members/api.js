import { supabase } from '../../lib/supabaseClient'
import { invokeFunction } from '../../lib/functions'

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

// ---------------------------------------------------------------------------
// Account management. Admin and super admin only, enforced in the database and
// again inside each Edge Function.
// ---------------------------------------------------------------------------
const ADMIN_COLUMNS =
  'id, full_name, email, phone, class, section, role, is_active, must_change_password, created_at'

/** Reads full profile rows, including email and phone. Admins only. */
export async function fetchAccounts({ limit = 500 } = {}) {
  const { data, error } = await supabase
    .from('profiles')
    .select(ADMIN_COLUMNS)
    .order('full_name')
    .limit(limit)

  if (error) throw error
  return data
}

export async function createMember(payload) {
  return invokeFunction('create-member', payload)
}

export async function bulkCreateMembers(rows) {
  return invokeFunction('bulk-create-members', { rows })
}

export async function resetMemberPassword(userId) {
  return invokeFunction('reset-password', { user_id: userId })
}

export async function setMemberStatus({ userId, isActive }) {
  return invokeFunction('set-account-status', { user_id: userId, is_active: isActive })
}

// ---------------------------------------------------------------------------
// Profile change requests
// ---------------------------------------------------------------------------
const REQUEST_COLUMNS =
  'id, member_id, field, old_value, new_value, status, review_note, created_at, reviewed_by'

export async function fetchChangeRequests({ limit = 500 } = {}) {
  const { data, error } = await supabase
    .from('profile_change_requests')
    .select(`${REQUEST_COLUMNS}, profiles ( full_name, class, section )`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/** The signed-in member's own requests, for the profile page. */
export async function fetchMyChangeRequests(memberId) {
  const { data, error } = await supabase
    .from('profile_change_requests')
    .select(REQUEST_COLUMNS)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createChangeRequest({ memberId, field, oldValue, newValue }) {
  const { error } = await supabase.from('profile_change_requests').insert({
    member_id: memberId,
    field,
    old_value: oldValue ?? null,
    new_value: newValue,
  })
  if (error) throw error
}

export async function applyChangeRequest(requestId) {
  return invokeFunction('apply-profile-change', { request_id: requestId })
}

export async function rejectChangeRequest({ id, reviewerId, note }) {
  const { error } = await supabase
    .from('profile_change_requests')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      review_note: note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// The member's own profile row
// ---------------------------------------------------------------------------

/** Current values for the change-request form. Own row only, by RLS. */
export async function fetchOwnDetails(memberId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, phone, github_url, avatar_url')
    .eq('id', memberId)
    .single()

  if (error) throw error
  return data
}

/** `github_url` and `avatar_url` are self-service; the trigger guards the rest. */
export async function updateOwnProfile({ memberId, patch }) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', memberId)
  if (error) throw error
}
