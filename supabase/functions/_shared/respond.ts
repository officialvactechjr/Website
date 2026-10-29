import { corsHeaders } from './cors.ts'

/**
 * A safe error code the frontend maps to plain language. The browser never sees
 * a database or runtime message: `failure` swaps anything unexpected for one
 * fixed line, and the UI falls back to a fixed line per code as well.
 */
export type ErrorCode =
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error'

function codeFor(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'validation'
    case 401:
      return 'unauthenticated'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'conflict'
    case 429:
      return 'rate_limited'
    default:
      return 'server_error'
  }
}

export class HttpError extends Error {
  status: number
  code: ErrorCode

  constructor(status: number, message: string, code?: ErrorCode) {
    super(message)
    this.status = status
    this.code = code ?? codeFor(status)
  }
}

/** Every response leaves through here, so errors are always plain language. */
export function json(body: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
      // A temporary password may be in the body; never let a cache keep it.
      'Cache-Control': 'no-store',
    },
  })
}

export function failure(error: unknown, origin: string | null): Response {
  if (error instanceof HttpError) {
    return json({ code: error.code, error: error.message }, error.status, origin)
  }

  // Never leak a database or runtime message to the browser.
  console.error(error)
  return json(
    { code: 'server_error', error: 'Something went wrong on our side. Please try again.' },
    500,
    origin,
  )
}

/** Validates the request body with a Zod schema and returns the parsed value. */
export async function readJson<T>(
  req: Request,
  schema: {
    safeParse: (value: unknown) => {
      success: boolean
      data?: T
      error?: { issues: Array<{ message: string }> }
    }
  },
): Promise<T> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw new HttpError(400, 'That request was not readable.')
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new HttpError(
      400,
      parsed.error?.issues?.[0]?.message ?? 'Please check the form and try again.',
    )
  }
  return parsed.data as T
}
