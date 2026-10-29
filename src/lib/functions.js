import { supabase } from './supabaseClient'

/**
 * Calls an Edge Function and unwraps its plain-language error.
 *
 * Anything that needs the service role key runs in a function, never here: the
 * browser only ever holds the anon key and the caller's own session.
 */
export async function invokeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    let message = 'Something went wrong. Please try again.'
    try {
      const payload = await error.context.json()
      if (payload?.error) message = payload.error
    } catch {
      // The function never answered with JSON; keep the plain default.
    }
    throw new Error(message)
  }

  return data
}
