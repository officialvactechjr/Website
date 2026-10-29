import { createClient } from 'npm:@supabase/supabase-js@2'
import { HttpError } from './respond.ts'

const URL = Deno.env.get('SUPABASE_URL')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/** The service-role client. The key lives only in Edge Function secrets. */
export function service() {
  return createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export type Caller = {
  id: string
  role: 'member' | 'manager' | 'admin' | 'super_admin'
  full_name: string
  email: string | null
}

/**
 * Reads the caller from the request's JWT, then looks their role up in the
 * database. The role never comes from the request body.
 */
export async function caller(req: Request, allowed: Caller['role'][]): Promise<Caller> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Please sign in again.')

  const asCaller = createClient(URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await asCaller.auth.getUser(token)
  if (error || !data?.user) throw new HttpError(401, 'Please sign in again.')

  const { data: profile, error: profileError } = await service()
    .from('profiles')
    .select('id, role, is_active, full_name, email')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) throw new HttpError(403, 'We could not find your account.')
  if (!profile.is_active) throw new HttpError(403, 'This account is deactivated.')

  if (allowed.length > 0 && !allowed.includes(profile.role)) {
    throw new HttpError(403, 'You do not have permission for that.')
  }

  return profile as Caller
}
