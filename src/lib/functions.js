import { supabase } from './supabaseClient'

/**
 * Safe, plain-language text for every error code the Edge Functions can return.
 * The browser maps a code to one of these strings — it never shows whatever the
 * server happened to say, so a raw message can never reach a person.
 */
const MESSAGES = {
  unauthenticated: 'Your session expired. Log in again.',
  forbidden: 'You are not allowed to do this.',
  not_found: 'That account no longer exists.',
  conflict: 'That email already has an account.',
  rate_limited: 'That was a lot of requests. Please wait a minute and try again.',
  server_error: 'The account service had a problem. Nothing was changed. Please try again.',
}

/** The function was never deployed, or the network never reached it. */
function unreachable(name) {
  return `The account service is not reachable. The owner needs to deploy the ${name} function (see docs/OWNER-ACTIONS.md).`
}

/** A plain-language Error that also carries the safe code, so a caller can react. */
function fail(message, code) {
  const error = new Error(message)
  error.code = code
  return error
}

/**
 * Calls an Edge Function and turns any failure into one plain-language line.
 *
 * The only detail we pass through is a `validation` message (written for a
 * person by the function); everything else is mapped from its code, so a stack
 * trace, a key or a database message can never appear in the UI.
 *
 * Anything that needs the service role key runs in a function, never here: the
 * browser only ever holds the anon key and the caller's own session.
 */
export async function invokeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (!error) return data

  let payload = null
  try {
    payload = await error.context?.json?.()
  } catch {
    // No JSON answer (a missing function, or no network): handled below.
  }

  if (payload?.code === 'validation') {
    throw fail(payload.error || 'Please check the form and try again.', 'validation')
  }
  if (payload?.code && MESSAGES[payload.code]) throw fail(MESSAGES[payload.code], payload.code)

  // No code, and no HTTP answer at all (or a 404): the function is not reachable.
  const status = error.context?.status
  if (!payload?.code && (!status || status === 404)) throw fail(unreachable(name), 'unreachable')

  throw fail('Something went wrong on our side. Please try again.', 'server_error')
}
