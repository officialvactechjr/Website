import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter the email given to you by the club'),
  password: z.string().min(1, 'Enter your password'),
})

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    message: 'The two passwords do not match',
    path: ['confirm'],
  })
