import { supabase } from '../../lib/supabaseClient'

const LOG_COLUMNS =
  'id, member_id, points, reason, given_by, created_at, ' +
  'member:profiles!points_log_member_id_fkey ( full_name ), ' +
  'giver:profiles!points_log_given_by_fkey ( full_name )'

/** The audit trail. Admin and Super Admin only, and read-only by design. */
export async function fetchPointsLog({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from('points_log')
    .select(LOG_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * One award or deduction. The row always carries the caller as `given_by` (the
 * database refuses anything else) and is never editable afterwards.
 */
export async function awardPoints({ memberId, points, reason, givenById }) {
  const { error } = await supabase.from('points_log').insert({
    member_id: memberId,
    points,
    reason,
    given_by: givenById,
  })

  if (error) throw error
}
