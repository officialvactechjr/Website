import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().trim().min(3, 'Give the event a title'),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  starts_at: z.string().min(1, 'Pick a start date'),
  ends_at: z.string().optional(),
  cover_image: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
  status: z.enum(['draft', 'published', 'cancelled']),
})
