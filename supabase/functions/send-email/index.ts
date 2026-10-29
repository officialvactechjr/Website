import { z } from 'npm:zod@4'
import { caller, service } from '../_shared/auth.ts'
import { preflight } from '../_shared/cors.ts'
import { emailProvider, safeBody, safeSubject } from '../_shared/email.ts'
import { rateLimit } from '../_shared/rateLimit.ts'
import { failure, HttpError, json, readJson } from '../_shared/respond.ts'

// A hard cap per call, so one click can never blast the free-tier quota or the
// whole club at once. The admin sends the next group when this one is through.
const MAX_RECIPIENTS = 100

// Resend's free tier allows about two requests a second. Sending one at a time
// with a small gap keeps us inside it without extra machinery.
const SEND_SPACING_MS = 550

const GROUPS = ['all_active_members', 'selected_members', 'membership_applicants'] as const

const schema = z.object({
  group: z.enum(GROUPS),
  user_ids: z.array(z.uuid()).max(MAX_RECIPIENTS).optional(),
  subject: z.string().trim().min(3, 'Write a subject').max(200),
  body: z.string().trim().min(10, 'Write a message').max(20000),
})

type Body = z.infer<typeof schema>

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Lower-cased and de-duplicated, because two rows can share one address. */
function tidy(addresses: (string | null)[]): string[] {
  const seen = new Set<string>()
  for (const address of addresses) {
    if (!address) continue
    const clean = address.trim().toLowerCase()
    if (EMAIL_SHAPE.test(clean)) seen.add(clean)
  }
  return [...seen]
}

async function recipientsFor({ group, user_ids }: Body): Promise<string[]> {
  const db = service()

  if (group === 'selected_members') {
    if (!user_ids?.length) throw new HttpError(400, 'Pick at least one member.')

    const { data, error } = await db
      .from('profiles')
      .select('email')
      .in('id', user_ids)
      .eq('is_active', true)

    if (error) throw error
    return tidy((data ?? []).map((row) => row.email))
  }

  if (group === 'membership_applicants') {
    const { data, error } = await db.from('membership_applications').select('email')
    if (error) throw error
    return tidy((data ?? []).map((row) => row.email))
  }

  const { data, error } = await db
    .from('profiles')
    .select('email')
    .eq('role', 'member')
    .eq('is_active', true)

  if (error) throw error
  return tidy((data ?? []).map((row) => row.email))
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') return preflight(origin)

  try {
    const me = await caller(req, ['admin', 'super_admin'])
    // Sending mail is expensive and slow: five dispatches per ten minutes is
    // plenty for a club, and stops a stuck button emptying the quota.
    rateLimit(`send-email:${me.id}`, 5, 600_000)

    const input = await readJson(req, schema)
    const recipients = await recipientsFor(input)

    if (recipients.length === 0) throw new HttpError(400, 'That group has no one to email.')
    if (recipients.length > MAX_RECIPIENTS) {
      throw new HttpError(
        400,
        `That is ${recipients.length} people. This function sends to at most ${MAX_RECIPIENTS} at a time — narrow the group.`,
      )
    }

    // Escaped once, sent to everyone: no entry in the body can become markup.
    const subject = safeSubject(input.subject)
    const text = safeBody(input.body)
    const provider = emailProvider()

    let sent = 0
    const failed: string[] = []

    for (const [index, to] of recipients.entries()) {
      if (index > 0) await delay(SEND_SPACING_MS)
      try {
        await provider.send({ to, subject, text })
        sent += 1
      } catch {
        // The address is kept for the log summary only; the browser never sees it.
        failed.push(to)
      }
    }

    const db = service()
    await db.from('email_log').insert({
      sent_by: me.id,
      subject,
      body: text,
      recipient_group: input.group,
      recipient_count: sent,
      provider: provider.name,
      status: failed.length === recipients.length ? 'failed' : 'sent',
      error: failed.length ? `${failed.length} of ${recipients.length} could not be sent` : null,
    })

    return json({ sent, failed: failed.length, total: recipients.length }, 200, origin)
  } catch (error) {
    return failure(error, origin)
  }
})
