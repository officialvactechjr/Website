import { service } from './auth.ts'
import { temporaryPassword } from './password.ts'

export type NewMember = {
  full_name: string
  email: string
  class: string
  section: string
  phone?: string
  github_url?: string
  password?: string
}

export type NewStaff = {
  full_name: string
  email: string
  role: 'manager' | 'admin'
  password?: string
}

export type CreateResult =
  | { ok: true; email: string; temp_password: string }
  | { ok: false; email: string; error: string; code: 'conflict' | 'server_error' }

/** True when the Auth error means the email is already taken. */
function isDuplicate(message: string | undefined): boolean {
  return /already|exists|registered/i.test(message ?? '')
}

/**
 * Creates the login and its profile row. If the profile cannot be written the
 * login is deleted again, so we never leave an account with no profile — that is
 * the state that shows a member the "we could not load your account" screen.
 *
 * A typed password is used as-is (the caller has already validated it); with no
 * password a strong random one is generated. The password is returned to the
 * caller and never stored or logged.
 */
export async function createMemberAccount(input: NewMember): Promise<CreateResult> {
  const password = input.password?.trim() || temporaryPassword()

  const { data, error } = await service().auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
  })

  if (error || !data?.user) {
    return {
      ok: false,
      email: input.email,
      error: isDuplicate(error?.message)
        ? 'That email already has an account.'
        : 'We could not create that login.',
      code: isDuplicate(error?.message) ? 'conflict' : 'server_error',
    }
  }

  const { error: profileError } = await service()
    .from('profiles')
    .insert({
      id: data.user.id,
      email: input.email,
      full_name: input.full_name,
      class: input.class,
      section: input.section,
      phone: input.phone || null,
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
      code: 'server_error',
    }
  }

  return { ok: true, email: input.email, temp_password: password }
}

/**
 * Creates a staff login (a manager or an admin). Staff carry no class, section or
 * phone. This is the only place a staff account is created, and it can never
 * produce a super admin — that account is handed over by hand.
 */
export async function createStaffAccount(input: NewStaff): Promise<CreateResult> {
  const password = input.password?.trim() || temporaryPassword()

  const { data, error } = await service().auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
  })

  if (error || !data?.user) {
    return {
      ok: false,
      email: input.email,
      error: isDuplicate(error?.message)
        ? 'That email already has an account.'
        : 'We could not create that login.',
      code: isDuplicate(error?.message) ? 'conflict' : 'server_error',
    }
  }

  const { error: profileError } = await service().from('profiles').insert({
    id: data.user.id,
    email: input.email,
    full_name: input.full_name,
    role: input.role,
    must_change_password: true,
  })

  if (profileError) {
    await service().auth.admin.deleteUser(data.user.id)
    return {
      ok: false,
      email: input.email,
      error: 'The profile could not be saved, so nothing was created.',
      code: 'server_error',
    }
  }

  return { ok: true, email: input.email, temp_password: password }
}
