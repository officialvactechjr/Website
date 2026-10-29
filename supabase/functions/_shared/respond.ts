import { corsHeaders } from './cors.ts'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Every response leaves through here, so errors are always plain language. */
export function json(body: unknown, status = 200, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

export function failure(error: unknown, origin: string | null): Response {
  if (error instanceof HttpError) return json({ error: error.message }, error.status, origin)

  // Never leak a database or runtime message to the browser.
  console.error(error)
  return json({ error: 'Something went wrong on our side. Please try again.' }, 500, origin)
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
