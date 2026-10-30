import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, Mail, Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import ProfileMenu from './ProfileMenu'
import { useAuth } from '../../context/useAuth'
import { STAFF_ROLES } from '../../lib/constants'
import { cn } from '../../lib/utils'
// Inlined as data URIs: two requests fewer, and as WebP they cost ~24 KB
// instead of ~75 KB of PNG riding inside the entry bundle.
import logoMark from '../../assets/logo-mark.webp?inline'
import logoWord from '../../assets/logo-word.webp?inline'

// The club's landing-page nav. `anchor` items are plain links (an in-page jump),
// never "active". The extra public pages (notices, gallery, contributors, the
// board) stay reachable from the footer.
const LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/home#about', label: 'About Us', anchor: true },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/members', label: 'Community' },
]

// A 44px touch target around the text without moving the hairline: the pseudo
// element pads the link's hit area up and down (the nav is a flex row, so the
// link is already a flex item and positioning it is safe).
const linkClass = ({ isActive }) =>
  cn(
    "relative border-b py-1.5 text-sm font-medium transition-colors ease-assemble after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
    isActive
      ? 'border-primary text-text'
      : 'border-transparent text-muted hover:border-primary hover:text-text',
  )

const anchorClass =
  "relative border-b border-transparent py-1.5 text-sm font-medium text-muted transition-colors ease-assemble after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] hover:border-primary hover:text-text"

// Drawer rows: the current page keeps a 1px gold hairline at the left edge.
const drawerClass = ({ isActive }) =>
  cn(
    'border-b border-b-border border-l py-4 pl-3 font-medium transition-colors ease-assemble',
    isActive ? 'border-l-primary text-text' : 'border-l-transparent text-muted',
  )

const drawerPlain =
  'border-b border-b-border border-l border-l-transparent py-4 pl-3 font-medium text-muted'

export default function Navbar() {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  // Staff browsing the public site get a way back to the panel. Too tight for
  // the header on a phone, so there it lives in the drawer instead.
  const isStaff = STAFF_ROLES.includes(profile?.role)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto flex h-[76px] max-w-[1180px] items-center gap-5 px-[clamp(16px,4vw,40px)]">
        <Link
          to="/home"
          className="mr-auto flex min-h-11 flex-none items-center gap-3"
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

        <nav className="hidden items-center gap-[30px] xl:flex" aria-label="Main">
          {LINKS.map((link) =>
            link.anchor ? (
              <Link key={link.to} to={link.to} className={anchorClass}>
                {link.label}
              </Link>
            ) : (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        <Link
          to="/contact"
          aria-label="Contact"
          className="hidden h-11 flex-none items-center gap-2 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:text-text xl:flex"
        >
          <Mail className="size-5" aria-hidden="true" />
          <span>Contact</span>
        </Link>

        {isStaff && (
          <Button
            as={Link}
            to="/admin"
            size="sm"
            variant="secondary"
            className="hidden min-h-11 flex-none sm:inline-flex"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Back to admin panel
          </Button>
        )}

        {profile ? (
          <ProfileMenu />
        ) : (
          <Button
            as={Link}
            to="/login"
            size="sm"
            variant="secondary"
            className="min-h-11 max-lg:hidden"
          >
            Get Started
          </Button>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-11 flex-none place-items-center rounded-md border border-border-strong text-text xl:hidden"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border xl:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col px-[clamp(16px,4vw,40px)]">
            {LINKS.map((link) =>
              link.anchor ? (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={drawerPlain}
                >
                  {link.label}
                </Link>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={drawerClass}
                >
                  {link.label}
                </NavLink>
              ),
            )}

            <Link to="/contact" onClick={() => setOpen(false)} className={drawerPlain}>
              Contact
            </Link>

            {isStaff && (
              <Link to="/admin" onClick={() => setOpen(false)} className={drawerPlain}>
                Back to admin panel
              </Link>
            )}

            {!profile && (
              <Button as={Link} to="/login" onClick={() => setOpen(false)} className="my-5">
                Get Started
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
