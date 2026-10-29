// Outbound email: one tiny adapter per provider, so swapping Resend for Brevo is
// a secret change and nothing else.
//
// Everything sent here is PLAIN TEXT. There is no HTML path on purpose: the
// subject and body arrive from a form, and escaping them means a pasted tag can
// never become markup in someone's inbox.

export type Mail = { to: string; subject: string; text: string }

export type EmailProvider = {
  name: string
  /** Throws on failure with a message safe to show an admin. */
  send(mail: Mail): Promise<void>
}

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escapes markup characters, so form input can never turn into HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => escapeMap[char])
}

/** Collapses control characters and trims; used on every string from a form. */
export function plainText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .split('\r\n')
    .join('\n')
    .trim()
}

/** A subject line: escaped, and never allowed to contain a newline. */
export function safeSubject(value: string): string {
  return escapeHtml(plainText(value).replace(/[\r\n]+/g, ' ')).slice(0, 200)
}

/** A message body: escaped, newlines kept, length already bounded by the schema. */
export function safeBody(value: string): string {
  return escapeHtml(plainText(value))
}

async function providerError(response: Response, fallback: string): Promise<never> {
  const detail = await response.text().catch(() => '')
  console.error(`email provider ${response.status}: ${detail.slice(0, 400)}`)
  throw new Error(fallback)
}

const resend: EmailProvider = {
  name: 'resend',
  async send({ to, subject, text }) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY') ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('SENDER_EMAIL') ?? '',
        to: [to],
        subject,
        text,
      }),
    })

    if (!response.ok) await providerError(response, 'The email provider refused the message.')
  },
}

const brevo: EmailProvider = {
  name: 'brevo',
  async send({ to, subject, text }) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': Deno.env.get('BREVO_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: Deno.env.get('SENDER_EMAIL') ?? '' },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    })

    if (!response.ok) await providerError(response, 'The email provider refused the message.')
  },
}

const PROVIDERS: Record<string, EmailProvider> = { resend, brevo }

/** `EMAIL_PROVIDER` picks the adapter; Resend is the default. */
export function emailProvider(): EmailProvider {
  const chosen = (Deno.env.get('EMAIL_PROVIDER') ?? 'resend').toLowerCase()
  const provider = PROVIDERS[chosen]

  if (!provider) throw new Error(`Unknown email provider: ${chosen}`)
  if (!Deno.env.get('SENDER_EMAIL')) {
    throw new Error('SENDER_EMAIL is not set for this function.')
  }

  return provider
}
