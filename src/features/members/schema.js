import { z } from 'zod'

// The same rule the Edge Functions enforce, so the admin sees the problem
// immediately. The server checks it again — that is the check that counts.
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

/** Returns a plain-language problem with a typed password, or null. */
export function passwordProblem(password, email, fullName) {
  const value = String(password ?? '')
  if (value.length < 10) return 'Use at least 10 characters.'

  const lower = value.toLowerCase()
  const local = String(email ?? '')
    .split('@')[0]
    .toLowerCase()
  if (local.length >= 3 && lower.includes(local)) {
    return 'The password must not contain the email name.'
  }
  for (const part of String(fullName ?? '')
    .toLowerCase()
    .split(/\s+/)) {
    if (part.length >= 3 && lower.includes(part)) {
      return 'The password must not contain the person’s name.'
    }
  }
  if (COMMON.has(lower)) return 'That password is too common. Choose another.'

  return null
}

// The member-editable half of a profile (Phase 6 profile page and its change
// requests). Name, class and section are NOT here: those need admin approval.
export const memberProfileSchema = z.object({
  github_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
  avatar_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
})

/** The five fields a member may only ask for. The database allows exactly these. */
export const CHANGE_FIELDS = [
  { value: 'email', label: 'Email address', hint: 'You will sign in with the new one.' },
  { value: 'phone', label: 'Phone number', hint: 'Kept private: staff only.' },
  { value: 'full_name', label: 'Full name', hint: 'Shown publicly on your projects.' },
  { value: 'class', label: 'Class', hint: 'For example: 12.' },
  { value: 'section', label: 'Section', hint: 'For example: A.' },
]

export const changeRequestSchema = z.object({
  field: z.enum(['email', 'phone', 'full_name', 'class', 'section']),
  new_value: z.string().trim().min(1, 'Write the new value').max(160, 'That is too long'),
})
