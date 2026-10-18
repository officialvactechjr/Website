import { useNavigate } from 'react-router-dom'
import PasswordForm from './PasswordForm'
import { useAuth } from '../../context/useAuth'
import { homeForRole } from '../../lib/constants'
import Card from '../../components/ui/Card'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <h1 className="text-2xl font-semibold sm:text-3xl">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted">
        Your account still has the temporary password the club team gave you. Pick your own before
        you continue.
      </p>

      <Card className="mt-6">
        <PasswordForm onDone={() => navigate(homeForRole(profile.role), { replace: true })} />
      </Card>
    </div>
  )
}
