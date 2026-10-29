import { z } from 'npm:zod@4'
import { audit } from '../_shared/audit.ts'
import { caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

// `super_admin` is deliberately absent: this function can never create or
// promote one, and it cannot demote one either. The institution's account is
// handed over by hand, not from a screen.
const schema = z.object({
  user_id: z.uuid('Pick an account'),
  role: z.enum(['member', 'manager', 'admin']),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['super_admin'])
    rateLimit(`change-role:${me.id}`, 30)

    const { user_id, role } = await readJson(req, schema)

    if (user_id === me.id) throw new HttpError(400, 'You cannot change your own role.')

    const { data: target, error: targetError } = await service()
      .from('profiles')
      .select('id, role, full_name, email, class, section')
      .eq('id', user_id)
      .single()

    if (targetError || !target) throw new HttpError(404, 'We could not find that account.')
    if (target.role === 'super_admin') {
      throw new HttpError(400, 'A super admin cannot be changed from here. Hand it over in person.')
    }

    // A member needs a class and a section; staff must not carry one.
    if (role === 'member' && (!target.class || !target.section)) {
      throw new HttpError(
        400,
        'This account has no class or section. Set them before making it a member.',
        'validation',
      )
    }

    const patch = role === 'member' ? { role } : { role, class: null, section: null, phone: null }

    const { error } = await service().from('profiles').update(patch).eq('id', user_id)
    if (error) throw new HttpError(500, 'We could not change that role. Please try again.')

    await audit({
      actor: me,
      action: 'role.change',
      targetId: user_id,
      targetEmail: target.email,
      detail: { from: target.role, to: role },
    })

    return json({ id: user_id, role }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
