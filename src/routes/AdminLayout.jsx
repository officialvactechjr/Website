import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  ClipboardCheck,
  FileText,
  Globe,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import Button from '../components/ui/Button'
import ProfileMenu from '../components/layout/ProfileMenu'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/useAuth'
import {
  ADMIN_ROLES,
  INTRO_PLAYED_KEY,
  STAFF_ROLES,
  VIEW_SITE_KEY,
  writeFlag,
} from '../lib/constants'
import { cn } from '../lib/utils'
import logoMark from '../assets/logo-mark.webp'
import logoWord from '../assets/logo-word.webp'

// Every section the role may open — PRD section 5.3 and 5.4. One entry is one
// row in the sidebar; its `items` are the section's pages, drawn as tabs in the
// contextual toolbar. `roles` narrows an entry below the default of "any staff
// member". The same roles guard the route itself in routes/index.jsx.
//
// Nothing here is an action. Create/export/filter buttons belong to the page
// (`PageHeader`'s `action` slot and `DataTable`'s `toolbar`), never to this nav.
const NAV = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    items: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    label: 'Content',
    icon: FileText,
    items: [
      { to: '/admin/notices', label: 'Notices' },
      { to: '/admin/events', label: 'Events' },
      { to: '/admin/bod', label: 'Board of directors' },
      { to: '/admin/gallery', label: 'Gallery' },
      { to: '/admin/registration-forms', label: 'Registration forms' },
      { to: '/admin/form-templates', label: 'Form templates' },
    ],
  },
  {
    label: 'Intake',
    icon: ClipboardCheck,
    items: [
      { to: '/admin/registrations', label: 'Event registrations' },
      { to: '/admin/applications', label: 'Membership applications' },
      { to: '/admin/approvals', label: 'Project approvals' },
      { to: '/admin/suggestions', label: 'Suggestions' },
    ],
  },
  {
    label: 'People',
    icon: Users,
    items: [
      { to: '/admin/members', label: 'Members', roles: ADMIN_ROLES },
      { to: '/admin/staff', label: 'Staff', roles: ADMIN_ROLES },
      { to: '/admin/profile-changes', label: 'Profile changes', roles: ADMIN_ROLES },
      { to: '/admin/points', label: 'Points', roles: ADMIN_ROLES },
    ],
  },
  {
    label: 'System',
    icon: Settings,
    items: [
      { to: '/admin/emails', label: 'Emails', roles: ADMIN_ROLES },
      { to: '/admin/settings/membership', label: 'Membership window', roles: ADMIN_ROLES },
      { to: '/admin/roles', label: 'Roles', roles: ['super_admin'] },
      { to: '/admin/settings', label: 'Settings', roles: ['super_admin'] },
    ],
  },
]

export default function AdminLayout() {
  const { profile } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Leave the panel for the public site: remember the choice for this session so
  // `/` does not bounce straight back, and skip the intro on the way.
  function viewWebsite() {
    writeFlag(VIEW_SITE_KEY, true)
    writeFlag(INTRO_PLAYED_KEY, true)
  }

  // Drop the entries this role may not open, and any section left empty.
  // A hidden link is never the only defence — the route has the same guard.
  const sections = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => (item.roles ?? STAFF_ROLES).includes(profile?.role)),
  }))
    .filter((section) => section.items.length > 0)
    .map((section) => {
      // Which page the URL is on, so the tabs highlight it. The
      // longest matching prefix wins (/admin/settings/membership over /admin).
      const page = [...section.items]
        .sort((a, b) => b.to.length - a.to.length)
        .find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))

      // The sidebar opens a section at its first page, so one click always lands.
      return { ...section, page, to: section.items[0].to, active: Boolean(page) }
    })

  const current = sections.find((section) => section.active)

  return (
    <div className="flex min-h-screen">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close sections"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          'scroll-thin fixed inset-y-0 left-0 z-50 w-60 overflow-y-auto border-r border-border bg-surface transition-transform ease-assemble lg:static lg:z-auto lg:translate-x-0 lg:transition-none',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <Link to="/admin" className="mr-auto font-semibold">
            VAC-TECH Jr.
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sections"
            className="grid size-11 place-items-center rounded-md text-muted hover:text-text lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-3">
          <Sidebar sections={sections} onNavigate={() => setMenuOpen(false)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-bg/85 px-4 backdrop-blur lg:px-8">
          {/* The club mark links home. These are plain images on purpose: the
              public header's logo slots (`[data-intro]`) belong to the intro
              animation's fly-in and must not be reused here. */}
          <Link
            to="/admin"
            className="flex flex-none items-center gap-2"
            aria-label="VAC-Tech Jr. admin"
          >
            <img
              src={logoMark}
              alt="VAC Tech Jr"
              width={288}
              height={100}
              className="h-6 w-auto sm:h-7"
            />
            <img
              src={logoWord}
              alt=""
              width={352}
              height={43}
              className="hidden h-3 w-auto sm:block"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open sections"
            aria-controls="admin-sidebar"
            aria-expanded={menuOpen}
            className="grid size-11 place-items-center rounded-md border border-border-strong text-text lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <p className="mr-auto truncate text-sm font-medium text-muted">
            {current?.label ?? 'Staff panel'}
          </p>

          <Button
            as={Link}
            to="/"
            size="sm"
            variant="secondary"
            onClick={viewWebsite}
            className="flex-none"
          >
            <Globe className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">View website</span>
            <span className="sm:hidden">View</span>
          </Button>

          <ProfileMenu />
        </header>

        {/* Contextual toolbar: the open section's pages, and nothing else. It
            scrolls sideways rather than wrapping, so it stays one line. */}
        {current && current.items.length > 1 && (
          <nav
            aria-label={`${current.label} pages`}
            className="scroll-thin sticky top-16 z-20 flex gap-1 overflow-x-auto border-b border-border bg-bg/85 px-4 backdrop-blur lg:px-8"
          >
            {current.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={item === current.page ? 'page' : undefined}
                className={cn(
                  '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ease-assemble',
                  item === current.page
                    ? 'border-primary text-text'
                    : 'border-transparent text-muted hover:text-text',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <main id="content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
