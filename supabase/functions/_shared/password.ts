/**
 * A temporary password the club team hands over in person.
 * Uses the platform's crypto source; ambiguous letters (l, I, O, 0, 1) are left
 * out so it can be read aloud without confusion.
 */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#%^&*'

export function temporaryPassword(length = 16): string {
  const out: string[] = []

  // 256 is not a multiple of the alphabet length, so a plain `% length` would
  // favour the first few characters. Bytes past the last whole multiple are
  // thrown away and redrawn instead.
  const limit = 256 - (256 % ALPHABET.length)
  const bytes = new Uint8Array(64)

  while (out.length < length) {
    crypto.getRandomValues(bytes)
    for (const byte of bytes) {
      if (out.length === length) break
      if (byte < limit) out.push(ALPHABET[byte % ALPHABET.length])
    }
  }

  return out.join('')
}

/**
 * A short list of the passwords that appear first in every breach dump. It is
 * not a full blacklist — the name and email checks catch the common case of a
 * club member choosing something guessable.
 */
const COMMON = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  'passw0rd',
  '1234567890',
  '12345678910',
  'qwertyuiop',
  'qwerty1234',
  'iloveyou12',
  'admin12345',
  'administrator',
  'letmein123',
  'welcome123',
  'changeme123',
  'vac-tech-jr',
  'vactechjr',
  'student123',
  'school1234',
])

/**
 * The server-side rule for a typed password. Returns a plain-language problem,
 * or null when the password is acceptable. The same rule runs in the admin UI
 * for instant feedback, but this is the one that counts.
 */
export function passwordProblem(password: string, email: string, fullName: string): string | null {
  const value = password ?? ''
  if (value.length < 10) return 'Use at least 10 characters.'

  const lower = value.toLowerCase()

  const local = (email.split('@')[0] ?? '').toLowerCase()
  if (local.length >= 3 && lower.includes(local)) {
    return 'The password must not contain the email name.'
  }

  for (const part of fullName.toLowerCase().split(/\s+/)) {
    if (part.length >= 3 && lower.includes(part)) {
      return 'The password must not contain the person’s name.'
    }
  }

  if (COMMON.has(lower)) return 'That password is too common. Choose another.'

  return null
}
