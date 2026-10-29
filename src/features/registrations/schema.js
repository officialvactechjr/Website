import { z } from 'zod'

/** The questions the form builder offers. Each one can be included and required. */
export const FORM_TEMPLATE = [
  { id: 'full_name', label: 'Full name', type: 'text' },
  { id: 'class', label: 'Class', type: 'text' },
  { id: 'section', label: 'Section', type: 'text' },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'tshirt', label: 'T-shirt size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'question', label: 'Anything else?', type: 'textarea' },
]

export const membershipApplicationSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(120),
  class: z.string().trim().max(40).optional(),
  section: z.string().trim().max(40).optional(),
  email: z.email('Enter a valid email address').max(160),
  phone: z.string().trim().max(30).optional(),
  reason: z.string().trim().max(1000).optional(),
  // Honeypot: hidden from people, irresistible to bots. `onSubmit` decides.
  website: z.string().optional(),
  consent: z
    .boolean()
    .refine((value) => value === true, 'Please tick the box so we can show your name'),
})

/** The form builder's own fields (ADM-05). */
export const registrationFormSchema = z
  .object({
    event_id: z.uuid('Pick an event'),
    opens_at: z.string().min(1, 'Pick an opening time'),
    closes_at: z.string().min(1, 'Pick a closing time'),
  })
  .refine((values) => new Date(values.closes_at) > new Date(values.opens_at), {
    message: 'Registration must close after it opens',
    path: ['closes_at'],
  })

/** A question the builder may include. */
export const formFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(2, 'Every question needs a label').max(120),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  required: z.boolean(),
  options: z.array(z.string()).max(20).optional(),
})

/** The membership window the admin opens and closes (ADM-14). */
export const membershipWindowSchema = z
  .object({
    label: z.string().trim().max(60).optional(),
    opens_at: z.string().min(1, 'Pick an opening date'),
    closes_at: z.string().min(1, 'Pick a closing date'),
    is_open: z.boolean().default(true),
  })
  .refine((values) => new Date(values.closes_at) > new Date(values.opens_at), {
    message: 'The window must close after it opens',
    path: ['closes_at'],
  })
