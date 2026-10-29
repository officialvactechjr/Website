import { z } from 'npm:zod@4'
import { audit } from '../_shared/audit.ts'
import { caller } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { createMemberAccount } from '../_shared/members.ts'
import { passwordProblem } from '../_shared/password.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

// Admin and super admin only. The role is read from the database, never the body.
const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter the member’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  class: z.string().trim().min(1, 'Class is required for a member').max(40),
  section: z.string().trim().min(1, 'Section is required for a member').max(40),
  phone: z.union([z.literal(''), z.string().trim().max(30)]).optional(),
  github_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
  // Empty or absent means "generate one"; anything else is validated below.
  password: z.union([z.literal(''), z.string().max(128)]).optional(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`create-member:${me.id}`, 30)

    const input = await readJson(req, schema)

    const typed = input.password?.trim() ?? ''
    if (typed) {
      const problem = passwordProblem(typed, input.email, input.full_name)
      if (problem) throw new HttpError(400, problem, 'validation')
    }

    const result = await createMemberAccount({ ...input, password: typed || undefined })
    if (!result.ok) {
      throw new HttpError(result.code === 'conflict' ? 409 : 500, result.error, result.code)
    }

    await audit({
      actor: me,
      action: 'member.create',
      targetEmail: result.email,
      detail: {
        class: input.class,
        section: input.section,
        password: typed ? 'typed' : 'generated',
      },
    })

    // The only time this password exists outside the club team's hands.
    return json({ email: result.email, temp_password: result.temp_password }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
