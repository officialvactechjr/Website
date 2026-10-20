import { z } from 'zod'

// The member upload/edit form (Phase 6). `status` is never sent from the client:
// the database defaults it to 'pending'.
export const projectSchema = z.object({
  title: z.string().trim().min(3, 'Give your project a title'),
  description: z.string().trim().min(10, 'Describe what it does in a sentence or two'),
  github_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
  image_url: z.union([z.literal(''), z.url('Enter a full link starting with https://')]).optional(),
})
