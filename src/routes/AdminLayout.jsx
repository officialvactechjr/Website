import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileText,
  GraduationCap,
  Images,
  IdCard,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Menu,
  MonitorSmartphone,
  Settings,
  Trophy,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'
import ThemeToggle from '../components/shared/ThemeToggle'
import Button from '../components/ui/Button'
import { useAuth } from '../context/useAuth'
import { cn } from '../lib/utils'

// Routes are from PHASES.md. Role-based filtering arrives in Phase 7 with the pages.
const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/notices', label: 'Notices', icon: FileText },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/bod', label: 'Board of directors', icon: Users },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/registration-forms', label: 'Registration forms', icon: ClipboardList },
  { to: '/admin/registrations', label: 'Event registrations', icon: ClipboardCheck },
  { to: '/admin/applications', label: 'Membership applications', icon: IdCard },
  { to: '/admin/approvals', label: 'Project approvals', icon: Eye },
  { to: '/admin/members', label: 'Members', icon: GraduationCap },
  { to: '/admin/points', label: 'Points', icon: Trophy },
  { to: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { to: '/admin/emails', label: 'Emails', icon: Mail },
  { to: '/admin/settings/membership', label: 'Membership window', icon: MonitorSmartphone },
  { to: '/admin/roles', label: 'Roles', icon: UserCog },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open sections"
          aria-controls="admin-sidebar"
          aria-expanded={menuOpen}
          className="grid size-11 place-items-center rounded-md border border-border-strong text-text"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <p className="mr-auto font-semibold">Admin</p>
        <ThemeToggle className="-mr-2" />
      </header>

      <aside
        id="admin-sidebar"
        className={cn(
          'border-b border-border bg-surface lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0',
          menuOpen ? 'block' : 'hidden lg:block',
        )}
      >
        <div className="flex items-center gap-3 px-4 pt-4">
          <p className="mr-auto font-semibold">VAC-TECH Jr.</p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sections"
            className="grid size-11 place-items-center rounded-md text-muted hover:text-text lg:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-3 py-4">
          <Sidebar items={NAV} onNavigate={() => setMenuOpen(false)} />
        </div>

        <div className="border-t border-border px-4 py-3">
          <p className="truncate text-sm text-muted">{profile?.full_name}</p>
          <Button variant="ghost" size="sm" className="mt-1 px-0" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center gap-4 border-b border-border px-8 py-3 lg:flex">
          <p className="mr-auto text-sm text-muted">Staff panel</p>
          <ThemeToggle className="-mr-2" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
