import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { homeForRole } from '../lib/constants'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Spinner />
    </div>
  )
}

/**
 * Signed in, loading has finished, and there is still no profile row. That only
 * happens when the row is missing or unreadable, so say so and offer a way out
 * instead of spinning forever.
 */
function NoProfile() {
  const { signOut } = useAuth()

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">We could not load your account</h1>
        <p className="mt-2 text-sm text-muted">
          Your profile is missing or could not be read. Sign out, then ask the club team to check
          your account.
        </p>
        <Button className="mt-5" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

/**
 * Gate for signed-in areas.
 * - `allow`: roles permitted here.
 * - `passwordChange`: the forced-password-change route itself.
 * The "must change password" redirect lives in AppGate (routes/index.jsx) so it
 * covers the public pages too.
 */
export default function ProtectedRoute({ allow, passwordChange = false }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (!profile) return <NoProfile />

  if (passwordChange) {
    return profile.must_change_password ? (
      <Outlet />
    ) : (
      <Navigate to={homeForRole(profile.role)} replace />
    )
  }

  if (allow && !allow.includes(profile.role)) {
    return <Navigate to={homeForRole(profile.role)} replace />
  }

  return <Outlet />
}
