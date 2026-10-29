import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import ProfileMenu from './ProfileMenu'
import { useAuth } from '../../context/useAuth'
import { cn } from '../../lib/utils'
import logoMark from '../../assets/logo-mark.png'
import logoWord from '../../assets/logo-word.png'

// Labels come from the club's landing page. Gallery, Contributors, Members, Join
// and Contact live in the footer and on Home, so every public page stays reachable.
const LINKS = [
  { to: '/', label: 'About', end: true },
  { to: '/notices', label: 'Notices' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/bod', label: 'Team' },
]

const linkClass = ({ isActive }) =>
  cn(
    'border-b py-1.5 text-sm font-medium transition-colors ease-assemble',
    isActive
      ? 'border-primary text-text'
      : 'border-transparent text-muted hover:border-primary hover:text-text',
  )

// Drawer rows: the current page keeps a 1px gold hairline at the left edge.
const drawerClass = ({ isActive }) =>
  cn(
    'border-b border-b-border border-l py-4 pl-3 font-medium transition-colors ease-assemble',
    isActive ? 'border-l-primary text-text' : 'border-l-transparent text-muted',
  )

export default function Navbar() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto flex h-[76px] max-w-[1180px] items-center gap-5 px-[clamp(16px,4vw,40px)]">
        <Link
          to="/"
          className="mr-auto flex flex-none items-center gap-3"
          data-intro-brand
          aria-label="VAC-Tech Jr. home"
        >
          <span className="hslot hart" data-intro="art">
            <img src={logoMark} alt="" className="h-full w-full" />
          </span>
          <span className="hslot htxt" data-intro="text">
            <img src={logoWord} alt="" className="h-full w-full" />
          </span>
        </Link>

        <nav className="hidden items-center gap-[30px] lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {profile ? (
          <ProfileMenu />
        ) : (
          <div className="hidden items-center gap-3.5 lg:flex">
            <Link
              to="/login"
              className="py-2 text-sm font-medium text-muted transition-colors hover:text-text"
            >
              Member login
            </Link>
            <Button as={Link} to="/join" size="sm">
              Join the club
            </Button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-11 flex-none place-items-center rounded-md border border-border-strong text-text lg:hidden"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border lg:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col px-[clamp(16px,4vw,40px)]">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={drawerClass}
              >
                {link.label}
              </NavLink>
            ))}

            {!profile && (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="border-b border-b-border border-l border-l-transparent py-4 pl-3 font-medium text-muted"
                >
                  Member login
                </NavLink>
                <Button as={Link} to="/join" onClick={() => setOpen(false)} className="my-5">
                  Join the club
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
