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
import SiteChrome from '../components/layout/SiteChrome'
import PageMeta from '../components/shared/PageMeta'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/useAuth'
import { ADMIN_ROLES, ROLES, STAFF_ROLES } from '../lib/constants'

// Route-level code splitting keeps the first bundle small. The admin panel, the
// auth pages and the member pages are only fetched when someone opens them.
const Landing = lazy(() => import('../pages/public/Landing'))
const Terms = lazy(() => import('../pages/public/Terms'))
const Privacy = lazy(() => import('../pages/public/Privacy'))
const Home = lazy(() => import('../pages/public/Home'))
const Notices = lazy(() => import('../pages/public/Notices'))
const NoticeDetail = lazy(() => import('../pages/public/NoticeDetail'))
const Events = lazy(() => import('../pages/public/Events'))
const EventDetail = lazy(() => import('../pages/public/EventDetail'))
const Contact = lazy(() => import('../pages/public/Contact'))
const Join = lazy(() => import('../pages/public/Join'))
const Bod = lazy(() => import('../pages/public/Bod'))
const Gallery = lazy(() => import('../pages/public/Gallery'))
const Projects = lazy(() => import('../pages/public/Projects'))
const ProjectDetail = lazy(() => import('../pages/public/ProjectDetail'))
const Contributors = lazy(() => import('../pages/public/Contributors'))
const Members = lazy(() => import('../pages/public/Members'))
const LoginPage = lazy(() => import('../features/auth/LoginPage'))
const ChangePasswordPage = lazy(() => import('../features/auth/ChangePasswordPage'))
const Profile = lazy(() => import('../pages/member/Profile'))
const MemberDashboard = lazy(() => import('../pages/member/Dashboard'))
const MemberSuggestions = lazy(() => import('../pages/member/Suggestions'))
const UploadProject = lazy(() => import('../pages/member/UploadProject'))
const EditProject = lazy(() => import('../pages/member/EditProject'))
const AdminLayout = lazy(() => import('./AdminLayout'))
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const NoticesAdmin = lazy(() => import('../pages/admin/NoticesAdmin'))
const EventsAdmin = lazy(() => import('../pages/admin/EventsAdmin'))
const BodAdmin = lazy(() => import('../pages/admin/BodAdmin'))
const GalleryAdmin = lazy(() => import('../pages/admin/GalleryAdmin'))
const FormBuilder = lazy(() => import('../pages/admin/FormBuilder'))
const FormTemplates = lazy(() => import('../pages/admin/FormTemplates'))
const Registrations = lazy(() => import('../pages/admin/Registrations'))
const Applications = lazy(() => import('../pages/admin/Applications'))
const MembershipWindow = lazy(() => import('../pages/admin/MembershipWindow'))
const MembersAdmin = lazy(() => import('../pages/admin/MembersAdmin'))
const MembersImport = lazy(() => import('../pages/admin/MembersImport'))
const StaffAdmin = lazy(() => import('../pages/admin/StaffAdmin'))
const Approvals = lazy(() => import('../pages/admin/Approvals'))
const ProfileChanges = lazy(() => import('../pages/admin/ProfileChanges'))
const Points = lazy(() => import('../pages/admin/Points'))
const SuggestionsAdmin = lazy(() => import('../pages/admin/SuggestionsAdmin'))
const Emails = lazy(() => import('../pages/admin/Emails'))
const Roles = lazy(() => import('../pages/admin/Roles'))
const SettingsAdmin = lazy(() => import('../pages/admin/Settings'))
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
  return (
    <>
      <PageMeta />
      <SiteChrome />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter(
  [
    {
      element: <AppGate />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            { index: true, element: ready(<Landing />) },
            { path: 'home', element: ready(<Home />) },
            { path: 'login', element: ready(<LoginPage />) },
            { path: 'notices', element: ready(<Notices />) },
            { path: 'notices/:id', element: ready(<NoticeDetail />) },
            { path: 'events', element: ready(<Events />) },
            { path: 'events/:id', element: ready(<EventDetail />) },
            { path: 'contact', element: ready(<Contact />) },
            { path: 'terms', element: ready(<Terms />) },
            { path: 'privacy', element: ready(<Privacy />) },
            { path: 'join', element: ready(<Join />) },
            { path: 'bod', element: ready(<Bod />) },
            { path: 'gallery', element: ready(<Gallery />) },
            { path: 'projects', element: ready(<Projects />) },
            { path: 'projects/:id', element: ready(<ProjectDetail />) },
            { path: 'contributors', element: ready(<Contributors />) },
            { path: 'members', element: ready(<Members />) },

            // Member pages are part of the same public site, only gated by login.
            {
              element: <ProtectedRoute allow={ROLES} />,
              children: [
                { path: 'profile', element: ready(<Profile />) },
                // The old address from the Phase 1 plan; kept so shared links live on.
                { path: 'member/profile', element: <Navigate to="/profile" replace /> },
                { path: 'member', element: ready(<MemberDashboard />) },
                { path: 'member/suggestions', element: ready(<MemberSuggestions />) },
                { path: 'member/projects/new', element: ready(<UploadProject />) },
                { path: 'member/projects/:id/edit', element: ready(<EditProject />) },
              ],
            },
          ],
        },

        {
          element: <ProtectedRoute passwordChange />,
          children: [{ path: 'change-password', element: ready(<ChangePasswordPage />) }],
        },

        // Staff only. Members never reach this, and inside the panel each route
        // carries its own role gate, matching the sidebar in AdminLayout.
        {
          element: <ProtectedRoute allow={STAFF_ROLES} />,
          children: [
            {
              element: ready(<AdminLayout />),
              children: [
                { path: 'admin', element: ready(<AdminDashboard />) },

                // Content, approvals, registrations and the suggestion inbox.
                { path: 'admin/notices', element: ready(<NoticesAdmin />) },
                { path: 'admin/events', element: ready(<EventsAdmin />) },
                { path: 'admin/bod', element: ready(<BodAdmin />) },
                { path: 'admin/gallery', element: ready(<GalleryAdmin />) },
                { path: 'admin/registration-forms', element: ready(<FormBuilder />) },
                { path: 'admin/form-templates', element: ready(<FormTemplates />) },
                { path: 'admin/registrations', element: ready(<Registrations />) },
                { path: 'admin/applications', element: ready(<Applications />) },
                { path: 'admin/approvals', element: ready(<Approvals />) },
                { path: 'admin/suggestions', element: ready(<SuggestionsAdmin />) },

                // Accounts, points, email and the membership window.
                {
                  element: <ProtectedRoute allow={ADMIN_ROLES} />,
                  children: [
                    { path: 'admin/members', element: ready(<MembersAdmin />) },
                    { path: 'admin/members/import', element: ready(<MembersImport />) },
                    { path: 'admin/staff', element: ready(<StaffAdmin />) },
                    { path: 'admin/profile-changes', element: ready(<ProfileChanges />) },
                    { path: 'admin/points', element: ready(<Points />) },
                    { path: 'admin/emails', element: ready(<Emails />) },
                    { path: 'admin/settings/membership', element: ready(<MembershipWindow />) },
                  ],
                },

                // The institution's own screens.
                {
                  element: <ProtectedRoute allow={['super_admin']} />,
                  children: [
                    { path: 'admin/roles', element: ready(<Roles />) },
                    { path: 'admin/settings', element: ready(<SettingsAdmin />) },
                  ],
                },
              ],
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
