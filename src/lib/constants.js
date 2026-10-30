// Shared constants. Role values mirror the `public.user_role` enum exactly.

export const ROLES = ['member', 'manager', 'admin', 'super_admin']

export const STAFF_ROLES = ['manager', 'admin', 'super_admin']

/** Accounts, points, email and the membership window: Admin and above. */
export const ADMIN_ROLES = ['admin', 'super_admin']

/**
 * The club's committees (Coding, Graphics Design, ECA, PR). **No table holds
 * them** — the closest thing is the membership form's committee options in
 * migration `0011` — so this one named constant is the single source for Home's
 * "Committees" number, instead of a literal inside the page.
 */
export const COMMITTEE_COUNT = 4

/**
 * Where a signed-in user belongs after login or a password change.
 * Members use the same public site as visitors; staff go to the panel.
 */
export function homeForRole(role) {
  return STAFF_ROLES.includes(role) ? '/admin' : '/home'
}

// Small flags. `index.html` reads the same string keys before first paint, so
// keep them in step there too.
/** A staff member chose "View website": `/` stops redirecting to the panel. Per session. */
export const VIEW_SITE_KEY = 'vacViewSite'
/** This browser belongs to a staff member, so `/` opens the panel by default. Persisted. */
export const STAFF_SESSION_KEY = 'vacStaff'
/** The intro plays once per session; `IntroAnimation` owns the key. */
export const INTRO_PLAYED_KEY = 'vacIntroPlayed'

/** `local` survives a new tab and a reload; the default stays within the session. */
function store(kind) {
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    return null // private mode
  }
}

export function readFlag(key, kind = 'session') {
  return store(kind)?.getItem(key) === '1'
}

export function writeFlag(key, on, kind = 'session') {
  const target = store(kind)
  if (!target) return
  if (on) target.setItem(key, '1')
  else target.removeItem(key)
}

/** Breadcrumb labels, keyed by URL segment. Unknown segments (ids) are skipped. */
export const ROUTE_LABELS = {
  home: 'Home',
  notices: 'Notices',
  events: 'Events',
  projects: 'Projects',
  gallery: 'Gallery',
  bod: 'Team',
  members: 'Member list',
  staff: 'Staff',
  import: 'Add many members',
  contributors: 'Top contributors',
  contact: 'Contact',
  terms: 'Terms and conditions',
  privacy: 'Privacy policy',
  join: 'Join the club',
  profile: 'My profile',
  member: 'My area',
  admin: 'Admin',
  approvals: 'Project approvals',
  applications: 'Membership applications',
  'registration-forms': 'Registration forms',
  'form-templates': 'Form templates',
  registrations: 'Event registrations',
  suggestions: 'Suggestions',
  points: 'Points',
  emails: 'Emails',
  roles: 'Roles',
  settings: 'Settings',
  'profile-changes': 'Profile changes',
  membership: 'Membership window',
}
