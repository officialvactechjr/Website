import { z } from 'zod'

export const suggestionSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, 'Write at least 10 characters')
    .max(2000, 'Keep it under 2000 characters'),
})
