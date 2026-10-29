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
