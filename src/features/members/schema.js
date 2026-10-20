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
