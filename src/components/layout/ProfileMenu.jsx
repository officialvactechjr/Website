import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  FolderGit,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Upload,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { STAFF_ROLES } from '../../lib/constants'
import { initials } from '../../lib/utils'

const ITEMS = [
  { to: '/profile', label: 'My profile', icon: User },
  { to: '/member', label: 'My projects', icon: FolderGit },
  { to: '/member/projects/new', label: 'Upload project', icon: Upload },
  { to: '/member/suggestions', label: 'Suggestion box', icon: Lightbulb },
]

export default function ProfileMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const container = useRef(null)
  const navigate = useNavigate()

  // Close on a click outside or Esc. Link clicks close it themselves.
  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!profile) return null

  const items = STAFF_ROLES.includes(profile.role)
    ? [...ITEMS, { to: '/admin', label: 'Admin panel', icon: LayoutDashboard }]
    : ITEMS

  async function handleSignOut() {
    setOpen(false)
    try {
      await signOut()
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
    }
    navigate('/', { replace: true })
  }

  return (
    <div ref={container} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border-strong p-0.5 pr-2 text-muted transition-colors hover:border-primary hover:text-primary"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="size-9 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-ink">
            {initials(profile.full_name)}
          </span>
        )}
        <ChevronDown className="size-4" aria-hidden="true" />
        <span className="sr-only">Profile menu</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-56 rounded-sm border border-border bg-surface p-1.5"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">{profile.full_name}</p>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-alt hover:text-text"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-surface-alt hover:text-text"
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
