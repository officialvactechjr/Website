import { z } from 'zod'

/** A saved template's editable parts. Questions come from the form that made it. */
export const templateNameSchema = z.object({
  name: z.string().trim().min(2, 'Give the template a name').max(80),
  description: z.string().trim().max(400).optional(),
})
