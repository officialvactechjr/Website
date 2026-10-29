import { z } from 'zod'

export const GROUPS = [
  { value: 'all_active_members', label: 'Every active member' },
  { value: 'selected_members', label: 'Chosen members' },
  { value: 'membership_applicants', label: 'Membership applicants' },
]

/** The function sends at most this many in one dispatch. */
export const RECIPIENT_CAP = 100

export const emailSchema = z.object({
  group: z.enum(['all_active_members', 'selected_members', 'membership_applicants']),
  subject: z
    .string()
    .trim()
    .min(3, 'Write a subject')
    .max(200, 'Keep the subject under 200 characters'),
  body: z.string().trim().min(10, 'Write the message').max(20000, 'The message is too long'),
})
