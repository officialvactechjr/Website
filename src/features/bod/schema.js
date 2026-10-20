import { z } from 'zod'

// Used by the BOD admin form in Phase 4.
export const bodMemberSchema = z.object({
  full_name: z.string().trim().min(3, 'Give the member a name'),
  position: z.string().trim().min(2, 'Add their position'),
  bio: z.string().trim().optional(),
  term_year: z.string().trim().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  photo_url: z.union([z.literal(''), z.url('Enter a full link starting with https://')]).optional(),
})
