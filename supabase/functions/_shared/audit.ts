import { service, type Caller } from './auth.ts'

/**
 * Appends one row to `audit_log`. The table is append-only and only Admin and
 * Super Admin may read it. A password is never passed here: `detail` carries
 * counts and role names, nothing secret.
 *
 * A failure to audit must never fail the action it records, so this swallows
 * its own error and logs to the function console instead.
 */
export async function audit(entry: {
  actor: Caller
  action: string
  targetId?: string | null
  targetEmail?: string | null
  detail?: Record<string, unknown>
}): Promise<void> {
  try {
    await service()
      .from('audit_log')
      .insert({
        actor_id: entry.actor.id,
        actor_role: entry.actor.role,
        action: entry.action,
        target_id: entry.targetId ?? null,
        target_email: entry.targetEmail ?? null,
        detail: entry.detail ?? {},
      })
  } catch (error) {
    console.error('audit_log write failed', error)
  }
}
