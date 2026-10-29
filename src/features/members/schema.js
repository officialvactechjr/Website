import { z } from 'zod'

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
