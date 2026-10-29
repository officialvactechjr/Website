import { z } from 'zod'

/** The questions the event form builder offers. Each one can be included and required. */
export const FORM_TEMPLATE = [
  { id: 'full_name', label: 'Full name', type: 'text' },
  { id: 'class', label: 'Class', type: 'text' },
  { id: 'section', label: 'Section', type: 'text' },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'tshirt', label: 'T-shirt size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'question', label: 'Anything else?', type: 'textarea' },
]

/**
 * The membership questions used when a window has no snapshot of its own (a
 * window created before migration `0008`, or one saved without fields). A new
 * window stores its own copy, so editing this list never changes a live form.
 *
 * The five core answers (full name, class, section, email, phone) and consent
 * keep their own columns; everything else lands in `membership_applications.answers`.
 */
export const MEMBERSHIP_FIELDS = [
  { id: 'full_name', label: 'Full name', type: 'text', required: true, max: 120 },
  {
    id: 'faculty',
    label: 'Faculty',
    type: 'text',
    required: true,
    max: 40,
    help: 'For example Science or Management',
  },
  {
    id: 'class',
    label: 'Class',
    type: 'text',
    required: true,
    max: 40,
    help: 'For example 11 or 12',
  },
  { id: 'section', label: 'Section', type: 'text', required: true, max: 40 },
  { id: 'email', label: 'Email', type: 'email', required: true, max: 160 },
  { id: 'skills', label: 'Skills / bio', type: 'textarea', required: false, max: 1000 },
  {
    id: 'committee',
    label: 'Which committee do you want to join?',
    type: 'select',
    required: true,
    options: ['Coding', 'Graphics Design', 'ECA', 'PR'],
  },
  {
    id: 'consent',
    label: "My name, class and GitHub link may be shown on the club's public pages.",
    type: 'consent',
    required: true,
  },
]

/** The answer columns that live on a membership application, not in `answers`. */
export const MEMBERSHIP_CORE = ['full_name', 'class', 'section', 'email', 'phone', 'reason']

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
  type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'url', 'multiselect', 'consent']),
  required: z.boolean(),
  options: z.array(z.string()).max(20).optional(),
  help: z.string().trim().max(200).optional(),
  max: z.number().int().positive().max(2000).optional(),
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
