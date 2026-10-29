import { invokeFunction } from '../../lib/functions'

/**
 * Super Admin only. The function refuses to touch a super admin, refuses a
 * self-change, and can never create or promote a super admin.
 */
export async function changeRole({ userId, role }) {
  return invokeFunction('change-role', { user_id: userId, role })
}
