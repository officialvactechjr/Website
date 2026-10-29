import { z } from 'zod'

export const pointsSchema = z.object({
  member_id: z.string().min(1, 'Pick a member'),
  points: z.coerce
    .number('Enter a whole number')
    .int('Use whole points')
    .refine((value) => value !== 0, 'Points cannot be zero')
    .refine((value) => Math.abs(value) <= 1000, 'Keep one award between -1000 and 1000'),
  reason: z.string().trim().min(3, 'Say why these points are given').max(200, 'Keep it short'),
})
