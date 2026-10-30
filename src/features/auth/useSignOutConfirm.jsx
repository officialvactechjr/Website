import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useAuth } from '../../context/useAuth'

/**
 * The app's one log-out flow: confirm first, then sign out and back to the
 * landing. Every log-out button goes through this so none can skip the confirm.
 * The forced sign-outs (a deactivated account, a failed login) deliberately do
 * not — they are not a choice the person is making.
 *
 * Returns the dialog to render and the opener to wire to a button.
 */
export function useSignOutConfirm() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function confirm() {
    setOpen(false)
    try {
      await signOut()
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
    }
    navigate('/', { replace: true })
  }

  const signOutDialog = (
    <ConfirmDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={confirm}
      title="Log out?"
      body="Do you really want to log out?"
      confirmLabel="Log out"
      confirmVariant="primary"
    />
  )

  return { requestSignOut: () => setOpen(true), signOutDialog }
}
