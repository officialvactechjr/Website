import { z } from 'zod'

/**
 * The keys this screen manages — public club metadata only. The table is
 * readable by every visitor, so nothing private ever belongs here.
 */
export const SETTING_FIELDS = [
  { key: 'site_name', label: 'Club name', hint: 'Shown on the contact page.' },
  { key: 'contact_email', label: 'Club email', hint: 'A club address, never a personal one.' },
  { key: 'location', label: 'Where the club meets', hint: 'Shown on the contact page.' },
  { key: 'facebook_url', label: 'Facebook link', hint: 'Leave empty for now.' },
  { key: 'instagram_url', label: 'Instagram link', hint: 'Leave empty for now.' },
  { key: 'github_url', label: 'GitHub link', hint: 'Leave empty for now.' },
]

const optionalText = (max) => z.string().trim().max(max)

export const settingsSchema = z.object({
  site_name: z.string().trim().min(2, 'Enter the club name').max(60),
  contact_email: z.union([z.literal(''), z.email('Enter a valid email address')]),
  location: optionalText(120),
  facebook_url: z.union([z.literal(''), z.url('Enter a full link, starting with https://')]),
  instagram_url: z.union([z.literal(''), z.url('Enter a full link, starting with https://')]),
  github_url: z.union([z.literal(''), z.url('Enter a full link, starting with https://')]),
})
