// Shared constants. Role values mirror the `public.user_role` enum exactly.

export const ROLES = ['member', 'manager', 'admin', 'super_admin']

export const STAFF_ROLES = ['manager', 'admin', 'super_admin']

/** Accounts, points, email and the membership window: Admin and above. */
export const ADMIN_ROLES = ['admin', 'super_admin']

/**
 * Where a signed-in user belongs after login or a password change.
 * Members use the same public site as visitors; staff go to the panel.
 */
export function homeForRole(role) {
  return STAFF_ROLES.includes(role) ? '/admin' : '/'
}

/** Breadcrumb labels, keyed by URL segment. Unknown segments (ids) are skipped. */
export const ROUTE_LABELS = {
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
