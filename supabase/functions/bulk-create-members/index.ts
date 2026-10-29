import { z } from 'npm:zod@4'
import { caller } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { createMemberAccount } from '../_shared/members.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, json, readJson } from '../_shared/respond.ts'

const MAX_ROWS = 200

const row = z.object({
  full_name: z.string().trim().min(2, 'Every row needs a full name').max(120),
  email: z.email('Every row needs a valid email address').max(160),
  class: z.string().trim().max(40).optional(),
  section: z.string().trim().max(40).optional(),
  github_url: z.union([z.literal(''), z.url('GitHub links must be full links')]).optional(),
})

const schema = z.object({
  rows: z
    .array(row)
    .min(1, 'Add at least one row')
    .max(MAX_ROWS, `Send at most ${MAX_ROWS} rows at a time`),
})

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    rateLimit(`bulk-create-members:${me.id}`, 10)

    const { rows } = await readJson(req, schema)

    // Rows the caller duplicated inside this one payload are reported up front,
    // so the summary is honest even though the second one never reaches Auth.
    const seen = new Set<string>()
    const results: Array<Record<string, unknown>> = []

    for (const [index, input] of rows.entries()) {
      const email = input.email.trim().toLowerCase()

      if (seen.has(email)) {
        results.push({
          row: index + 1,
          email: input.email,
          status: 'skipped',
          error: 'Repeated in this file.',
        })
        continue
      }
      seen.add(email)

      const result = await createMemberAccount({ ...input, email })
      results.push(
        result.ok
          ? {
              row: index + 1,
              email: result.email,
              status: 'created',
              temp_password: result.temp_password,
            }
          : { row: index + 1, email: input.email, status: 'failed', error: result.error },
      )
    }

    const created = results.filter((entry) => entry.status === 'created').length

    return json({ created, total: rows.length, results }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
