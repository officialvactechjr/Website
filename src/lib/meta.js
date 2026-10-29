/**
 * One title and one description per public route. Detail pages (`/notices/:id`)
 * fall back to their section's entry, so every route still has a unique title.
 *
 * The origin is the Cloudflare address the site is served from; change it here
 * and in `index.html` and `public/sitemap.xml` together.
 */
export const SITE = 'https://vactechjr.pages.dev'
export const SITE_NAME = 'VAC-Tech Jr.'

export const PAGE_META = {
  '/': {
    title: 'Introducing VAC-Tech Jr.',
    description:
      "The IT club of Vishwa Adarsha Academy's +2 section — we build real projects, learn new skills and host our own events.",
  },
  '/home': {
    title: 'Home',
    description:
      'Who the club is, what our committees do, and the students leading them this year.',
  },
  '/notices': {
    title: 'Notices',
    description: 'Official announcements from the VAC-Tech Jr. club team.',
  },
  '/events': {
    title: 'Events and workshops',
    description: 'What is coming up at the club, and everything it has already run.',
  },
  '/projects': {
    title: 'Projects',
    description: 'Apps, sites and tools built by club members, checked by the club team.',
  },
  '/gallery': {
    title: 'Photo gallery',
    description: 'Photos from club workshops, events and competitions.',
  },
  '/bod': {
    title: 'Board of Directors',
    description: 'The students running VAC-Tech Jr. this year, and the committees they lead.',
  },
  '/contributors': {
    title: 'Top contributors',
    description: 'The club members with the most points this year.',
  },
  '/members': {
    title: 'Member list',
    description: 'The club’s members, with their class and GitHub links.',
  },
  '/join': {
    title: 'Join the club',
    description: 'Membership opens for a short window — apply here before it closes automatically.',
  },
  '/contact': {
    title: 'Contact',
    description: 'How to reach the VAC-Tech Jr. club team.',
  },
  '/login': {
    title: 'Member login',
    description: 'Sign in with the email and password the club team gave you.',
  },
  '/terms': {
    title: 'Terms and conditions',
    description: 'The terms for using the VAC-Tech Jr. website.',
  },
  '/privacy': {
    title: 'Privacy policy',
    description: 'What the club stores about its members, and why.',
  },
  admin: {
    title: 'Staff panel',
    description: 'The club team’s private area.',
  },
}

/** Detail routes inherit their section's entry. */
export function metaFor(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  if (pathname.startsWith('/admin')) return PAGE_META.admin
  const section = pathname.split('/')[1]
  const key = `/${section}`
  if (PAGE_META[key]) return PAGE_META[key]
  return {
    title: 'Page not found',
    description: 'That page does not exist.',
  }
}
