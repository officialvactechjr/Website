import { z } from 'zod'

export const noticeSchema = z.object({
  title: z.string().trim().min(3, 'Give the notice a title'),
  body: z.string().trim().min(1, 'Write the notice'),
  is_pinned: z.boolean().default(false),
  published_at: z.string().min(1, 'Pick a date'),
})
