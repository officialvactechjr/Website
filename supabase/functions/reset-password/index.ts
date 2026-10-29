import { z } from 'npm:zod@4'
import { caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { temporaryPassword } from '../_shared/password.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

const schema = z.object({ user_id: z.uuid('Pick a member') })

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`reset-password:${me.id}`, 60)

    const { user_id } = await readJson(req, schema)

    const { data: target, error: targetError } = await service()
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user_id)
      .single()

    if (targetError || !target) throw new HttpError(404, 'We could not find that account.')

    // An admin must not be able to take over the institution's account.
    if (target.role === 'super_admin' && me.role !== 'super_admin') {
      throw new HttpError(403, 'Only a super admin can reset another super admin.')
    }

    const password = temporaryPassword()
    const { error } = await service().auth.admin.updateUserById(user_id, { password })
    if (error) throw new HttpError(500, 'We could not reset that password. Nothing was changed.')

    // Whoever holds this password must choose their own on the way in.
    await service().from('profiles').update({ must_change_password: true }).eq('id', user_id)

    return json(
      { email: target.email, full_name: target.full_name, temp_password: password },
      200,
      origin,
    )
  } catch (error) {
    return failure(error, origin)
  }
})
