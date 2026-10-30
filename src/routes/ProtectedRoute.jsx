import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useSignOutConfirm } from '../features/auth/useSignOutConfirm'
import { homeForRole } from '../lib/constants'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import intruder from '../assets/intruder.webp'

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
  const { requestSignOut, signOutDialog } = useSignOutConfirm()

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">We could not load your account</h1>
        <p className="mt-2 text-sm text-muted">
          Your profile is missing or could not be read. Sign out, then ask the club team to check
          your account.
        </p>
        <Button className="mt-5" onClick={requestSignOut}>
          Sign out
        </Button>
      </div>
      {signOutDialog}
    </div>
  )
}

/**
 * Signed in, but this area is not for their role. Say so with the club's
 * intruder illustration and send them somewhere they may go — a silent redirect
 * leaves them wondering why the link did nothing.
 */
function NotAllowed() {
  const { profile } = useAuth()

  return (
    <div className="hero-glow relative grid min-h-screen place-items-center overflow-hidden px-6 py-10 text-center">
      <div>
        <img
          src={intruder}
          alt=""
          aria-hidden="true"
          width={1000}
          height={562}
          className="mx-auto w-[min(20rem,64vw)]"
        />
        <h1 className="mt-6 text-2xl font-semibold">Halt — this area is not for you</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          That page belongs to the club team, and your account does not have access to it. If you
          think that is wrong, ask the club team to check your role.
        </p>
        <Button as={Link} to={homeForRole(profile?.role)} className="mt-6">
          Take me back
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

  if (allow && !allow.includes(profile.role)) return <NotAllowed />

  return <Outlet />
}
