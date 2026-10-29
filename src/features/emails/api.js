import { invokeFunction } from '../../lib/functions'
import { supabase } from '../../lib/supabaseClient'

// Service role only: the browser never writes this table, it reads the history.
const LOG_COLUMNS =
  'id, subject, recipient_group, recipient_count, provider, status, error, created_at, ' +
  'sender:profiles!email_log_sent_by_fkey ( full_name )'

export async function fetchEmailLog({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('email_log')
    .select(LOG_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Sends one dispatch. The function escapes everything, de-duplicates addresses,
 * caps the list, logs the send and answers with { sent, failed, total }.
 */
export async function sendBroadcast({ group, userIds, subject, body }) {
  return invokeFunction('send-email', {
    group,
    user_ids: group === 'selected_members' ? userIds : undefined,
    subject,
    body,
  })
}
