import { HttpError } from './respond.ts'

/**
 * A per-caller, per-function counter.
 *
 * `shortcut:` this lives in one Edge Function instance's memory, so it resets on
 * a cold start and each instance counts separately. It blunts an accidental loop
 * or one impatient caller, not a determined attacker. Upgrade to a `function_calls`
 * table (or Supabase's own rate limiting) if the account functions are ever
 * abused.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs = 60_000): void {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)

  if (recent.length >= limit) {
    throw new HttpError(429, 'That was a lot of requests. Please wait a minute and try again.')
  }

  recent.push(now)
  hits.set(key, recent)
}
