import { z } from 'npm:zod@4'
import { audit } from '../_shared/audit.ts'
import { caller } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { createStaffAccount } from '../_shared/members.ts'
import { passwordProblem } from '../_shared/password.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

// Super admin only. `super_admin` is deliberately absent: no function may create
// or promote one, so the institution's account is handed over by hand.
const schema = z.object({
  role: z.enum(['manager', 'admin']),
  full_name: z.string().trim().min(2, 'Enter the person’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  password: z.union([z.literal(''), z.string().max(128)]).optional(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['super_admin'])
    rateLimit(`create-staff:${me.id}`, 20)

    const input = await readJson(req, schema)

    const typed = input.password?.trim() ?? ''
    if (typed) {
      const problem = passwordProblem(typed, input.email, input.full_name)
      if (problem) throw new HttpError(400, problem, 'validation')
    }

    const result = await createStaffAccount({ ...input, password: typed || undefined })
    if (!result.ok) {
      throw new HttpError(result.code === 'conflict' ? 409 : 500, result.error, result.code)
    }

    await audit({
      actor: me,
      action: 'staff.create',
      targetEmail: result.email,
      detail: { role: input.role, password: typed ? 'typed' : 'generated' },
    })

    return json({ email: result.email, temp_password: result.temp_password }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
