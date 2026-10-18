// Every Supabase call for authentication lives here. Components never call the
// Supabase client directly.
import { supabase } from '../../lib/supabaseClient'

// Own profile only. `email` and `phone` are private: never select them for
// anything public, and members cannot write them (see migration 0006).
const PROFILE_COLUMNS =
  'id, full_name, class, section, github_url, avatar_url, role, is_active, must_change_password'

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function fetchOwnProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .single()
  if (error) throw error
  return data
}

export async function changePassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

/** Clear the forced-change flag once the new password is set. */
export async function clearPasswordChangeFlag() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)
  if (error) throw error
}
