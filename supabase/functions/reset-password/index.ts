import { z } from 'npm:zod@4'
import { audit } from '../_shared/audit.ts'
import { caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { passwordProblem, temporaryPassword } from '../_shared/password.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

const schema = z.object({
  user_id: z.uuid('Pick an account'),
  // Empty or absent means "generate one"; anything else is validated below.
  password: z.union([z.literal(''), z.string().max(128)]).optional(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`reset-password:${me.id}`, 60)

    const { user_id, password: typedInput } = await readJson(req, schema)

    const { data: target, error: targetError } = await service()
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user_id)
      .single()

    if (targetError || !target) throw new HttpError(404, 'We could not find that account.')

    // An admin manages members; staff accounts and the institution's own account
    // are only ever reset by a super admin.
    if (target.role !== 'member' && me.role !== 'super_admin') {
      throw new HttpError(403, 'Only a super admin can reset a staff password.', 'forbidden')
    }

    const typed = typedInput?.trim() ?? ''
    if (typed) {
      const problem = passwordProblem(typed, target.email ?? '', target.full_name ?? '')
      if (problem) throw new HttpError(400, problem, 'validation')
    }

    const password = typed || temporaryPassword()
    const { error } = await service().auth.admin.updateUserById(user_id, { password })
    if (error) throw new HttpError(500, 'We could not reset that password. Nothing was changed.')

    // Whoever holds this password must choose their own on the way in.
    const { error: flagError } = await service()
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', user_id)
    if (flagError) {
      throw new HttpError(
        500,
        'The password was changed, but the "change it at next login" flag was not set. Reset the password again.',
        'server_error',
      )
    }

    await audit({
      actor: me,
      action: 'account.reset_password',
      targetId: user_id,
      targetEmail: target.email,
      detail: { role: target.role, password: typed ? 'typed' : 'generated' },
    })

    return json(
      { email: target.email, full_name: target.full_name, temp_password: password },
      200,
      origin,
    )
  } catch (error) {
    return failure(error, origin)
  }
})
