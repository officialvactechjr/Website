import { z } from 'npm:zod@4'
import { caller } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { createMemberAccount } from '../_shared/members.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, json, readJson } from '../_shared/respond.ts'

// Admin and super admin only. The role is read from the database, never the body.
const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter the member’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  class: z.string().trim().max(40).optional(),
  section: z.string().trim().max(40).optional(),
  github_url: z.union([z.literal(''), z.url('Enter a full link')]).optional(),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`create-member:${me.id}`, 30)

    const input = await readJson(req, schema)
    const result = await createMemberAccount(input)

    if (!result.ok) return json({ error: result.error }, 400, origin)

    // The only time this password exists outside the club team's hands.
    return json({ email: result.email, temp_password: result.temp_password }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
