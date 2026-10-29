import { service } from './auth.ts'
import { temporaryPassword } from './password.ts'

export type NewMember = {
  full_name: string
  email: string
  class?: string
  section?: string
  github_url?: string
}

export type CreateResult =
  { ok: true; email: string; temp_password: string } | { ok: false; email: string; error: string }

/**
 * Creates the login and its profile row. If the profile cannot be written the
 * login is deleted again, so we never leave an account with no profile — that is
 * the state that shows a member the "we could not load your account" screen.
 *
 * The password is returned to the caller and never stored or logged.
 */
export async function createMemberAccount(input: NewMember): Promise<CreateResult> {
  const password = temporaryPassword()

  const { data, error } = await service().auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
  })

  if (error || !data?.user) {
    const duplicate = /already|exists|registered/i.test(error?.message ?? '')
    return {
      ok: false,
      email: input.email,
      error: duplicate ? 'That email already has an account.' : 'We could not create that login.',
    }
  }

  const { error: profileError } = await service()
    .from('profiles')
    .insert({
      id: data.user.id,
      email: input.email,
      full_name: input.full_name,
      class: input.class || null,
      section: input.section || null,
      github_url: input.github_url || null,
      role: 'member',
      must_change_password: true,
    })

  if (profileError) {
    await service().auth.admin.deleteUser(data.user.id)
    return {
      ok: false,
      email: input.email,
      error: 'The profile could not be saved, so nothing was created.',
    }
  }

  return { ok: true, email: input.email, temp_password: password }
}
