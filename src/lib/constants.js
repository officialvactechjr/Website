// Shared constants. Role values mirror the `public.user_role` enum exactly.

export const ROLES = ['member', 'manager', 'admin', 'super_admin']

export const STAFF_ROLES = ['manager', 'admin', 'super_admin']

/**
 * Where a signed-in user belongs after login or a password change.
 * Members use the same public site as visitors; staff go to the panel.
 */
export function homeForRole(role) {
  return STAFF_ROLES.includes(role) ? '/admin' : '/'
}
