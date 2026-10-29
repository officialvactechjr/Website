import { z } from 'npm:zod@4'
import { audit } from '../_shared/audit.ts'
import { activeSuperAdmins, caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

const schema = z.object({
  user_id: z.uuid('Pick an account'),
  is_active: z.boolean(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`set-account-status:${me.id}`, 60)

    const { user_id, is_active } = await readJson(req, schema)

    if (user_id === me.id) throw new HttpError(400, 'You cannot change your own account status.')

    const { data: target, error: targetError } = await service()
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', user_id)
      .single()

    if (targetError || !target) throw new HttpError(404, 'We could not find that account.')

    // An admin manages members; a staff account is only ever touched by a super
    // admin (this also covers the institution's own account).
    if (target.role !== 'member' && me.role !== 'super_admin') {
      throw new HttpError(403, 'Only a super admin can change a staff account.', 'forbidden')
    }

    // Never let the club lock itself out of its own site.
    if (!is_active && target.role === 'super_admin' && (await activeSuperAdmins()) <= 1) {
      throw new HttpError(
        400,
        'This is the last active super admin, so it cannot be deactivated.',
        'validation',
      )
    }

    const { error } = await service().from('profiles').update({ is_active }).eq('id', user_id)
    if (error) throw new HttpError(500, 'We could not change that account. Please try again.')

    await audit({
      actor: me,
      action: 'account.set_status',
      targetId: user_id,
      targetEmail: target.email,
      detail: { role: target.role, is_active },
    })

    return json({ id: user_id, is_active }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
