// Browser origins allowed to call these functions. Anything else gets no CORS
// headers, so the browser blocks the call before it reaches our code.
const ALLOWED_ORIGINS = ['https://vactechjr.pages.dev', 'http://localhost:5173']

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

/** Preflight. Every function answers OPTIONS with this. */
export function preflight(origin: string | null): Response {
  return new Response('ok', { headers: corsHeaders(origin) })
}
