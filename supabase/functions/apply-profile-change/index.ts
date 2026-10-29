import { z } from 'npm:zod@4'
import { caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

const schema = z.object({ request_id: z.uuid('Pick a request') })

const PROFILE_FIELDS = ['phone', 'full_name', 'class', 'section'] as const

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`apply-profile-change:${me.id}`, 60)

    const { request_id } = await readJson(req, schema)

    const { data: request, error: requestError } = await service()
      .from('profile_change_requests')
      .select('id, member_id, field, new_value, status')
      .eq('id', request_id)
      .single()

    if (requestError || !request) throw new HttpError(404, 'We could not find that request.')
    if (request.status !== 'pending')
      throw new HttpError(400, 'That request has already been decided.')

    const { data: member, error: memberError } = await service()
      .from('profiles')
      .select('id, email')
      .eq('id', request.member_id)
      .single()

    if (memberError || !member)
      throw new HttpError(404, 'The member for that request no longer exists.')

    if (request.new_value.length > 160) {
      throw new HttpError(400, 'That value is too long.')
    }

    if (request.field === 'email' && !z.email().safeParse(request.new_value).success) {
      throw new HttpError(400, 'That is not a valid email address.')
    }

    if (request.field === 'email') {
      // The login address lives in Auth, so both halves move together or neither.
      const { error: authError } = await service().auth.admin.updateUserById(member.id, {
        email: request.new_value,
        email_confirm: true,
      })
      if (authError)
        throw new HttpError(
          400,
          'That email could not be used. It may already belong to an account.',
        )
    } else if (!PROFILE_FIELDS.includes(request.field as (typeof PROFILE_FIELDS)[number])) {
      throw new HttpError(400, 'That field cannot be changed here.')
    }

    const patch: Record<string, string> = { [request.field]: request.new_value }

    const { error: updateError } = await service()
      .from('profiles')
      .update(patch)
      .eq('id', member.id)
    if (updateError) {
      // The two halves of an email change must never disagree: put the login
      // address back before giving up.
      if (request.field === 'email' && member.email) {
        await service().auth.admin.updateUserById(member.id, {
          email: member.email,
          email_confirm: true,
        })
      }
      throw new HttpError(500, 'We could not save that change. Please try again.')
    }

    await service()
      .from('profile_change_requests')
      .update({ status: 'approved', reviewed_by: me.id, updated_at: new Date().toISOString() })
      .eq('id', request.id)

    return json({ id: request.id, field: request.field, status: 'approved' }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
