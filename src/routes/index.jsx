import { lazy, Suspense } from 'react'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'
import PublicLayout from './PublicLayout'
import ProtectedRoute from './ProtectedRoute'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/useAuth'
import { ROLES, STAFF_ROLES } from '../lib/constants'

// Route-level code splitting keeps the first bundle small. The admin panel, the
// auth pages and the member pages are only fetched when someone opens them.
const Home = lazy(() => import('../pages/public/Home'))
const Notices = lazy(() => import('../pages/public/Notices'))
const NoticeDetail = lazy(() => import('../pages/public/NoticeDetail'))
const Events = lazy(() => import('../pages/public/Events'))
const EventDetail = lazy(() => import('../pages/public/EventDetail'))
const Contact = lazy(() => import('../pages/public/Contact'))
const Join = lazy(() => import('../pages/public/Join'))
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('../features/auth/ChangePasswordPage'))
const Profile = lazy(() => import('../pages/member/Profile'))
const MemberDashboard = lazy(() => import('../pages/member/Dashboard'))
const AdminLayout = lazy(() => import('./AdminLayout'))
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const NotFound = lazy(() => import('../pages/NotFound'))

function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner />
    </div>
  )
}

/** One Suspense per route, in the route table — never around the whole app. */
const ready = (element) => <Suspense fallback={<PageFallback />}>{element}</Suspense>

// First login forces a password change before anything else — this sits above
// every route so it covers the public pages too, not just the member pages.
function AppGate() {
  const { session, profile } = useAuth()
  const { pathname } = useLocation()

  if (session && profile?.must_change_password && pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  return <Outlet />
}

const router = createBrowserRouter(
  [
    {
      element: <AppGate />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            { index: true, element: ready(<Home />) },
            { path: 'login', element: ready(<LoginPage />) },
            { path: 'notices', element: ready(<Notices />) },
            { path: 'notices/:id', element: ready(<NoticeDetail />) },
            { path: 'events', element: ready(<Events />) },
            { path: 'events/:id', element: ready(<EventDetail />) },
            { path: 'contact', element: ready(<Contact />) },
            { path: 'join', element: ready(<Join />) },

            // Member pages are part of the same public site, only gated by login.
            {
              element: <ProtectedRoute allow={ROLES} />,
              children: [
                { path: 'profile', element: ready(<Profile />) },
                { path: 'member', element: ready(<MemberDashboard />) },
              ],
            },
          ],
        },

        {
          element: <ProtectedRoute passwordChange />,
          children: [{ path: 'change-password', element: ready(<ChangePasswordPage />) }],
        },

        // Staff only. Members never reach this.
        {
          element: <ProtectedRoute allow={STAFF_ROLES} />,
          children: [
            {
              element: ready(<AdminLayout />),
              children: [{ path: 'admin', element: ready(<AdminDashboard />) }],
            },
          ],
        },

        { path: '*', element: ready(<NotFound />) },
      ],
    },
  ],
  { future: { v7_startTransition: true } },
)

// The flag is set on both the router (where it changes behaviour) and the
// provider (which is what react-router checks before warning about it).
export default function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
