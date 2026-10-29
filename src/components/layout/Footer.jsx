import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
// lucide-react v1 ships no brand icons, so the social marks are inline paths.
const FACEBOOK =
  'M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.34 22.34 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z'
const TWITTER =
  'M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z'
const INSTAGRAM =
  'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'

// shortcut: the club's real profile URLs are not known yet; drop them in when they are.
const SOCIALS = [
  { label: 'Facebook', href: '#', path: FACEBOOK },
  { label: 'Twitter', href: '#', path: TWITTER },
  { label: 'Instagram', href: '#', path: INSTAGRAM },
]

const QUICK_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/members', label: 'Community' },
  { to: '/notices', label: 'Notices' },
]

// These carry the pages the navbar no longer lists, so nothing public is orphaned.
const RESOURCES = [
  { to: '/home#about', label: 'About Us' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contributors', label: 'Top contributors' },
  { to: '/bod', label: 'Board of directors' },
]

const CONTACTS = [
  { icon: Phone, label: '025-584505', href: 'tel:025-584505' },
  {
    icon: Mail,
    label: 'official.vactechjr@gmail.com',
    href: 'mailto:official.vactechjr@gmail.com',
  },
  { icon: MapPin, label: 'Aaitbare-itahari, Sunsari' },
]

// Legal pages — the club's own wording lives on them.
const LEGAL = [
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
]

const HEADING = 'text-lg font-semibold tracking-tight text-accent-soft'

const LINK = 'text-sm text-muted transition-colors hover:text-primary'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] py-[clamp(40px,6vw,64px)]">
        <div className="grid gap-x-[clamp(24px,4vw,56px)] gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div>
            <h2 className={HEADING}>About us</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Your Pathway to Innovation and Success. Empowering students with knowledge, skills,
              and confidence to shape the future.
            </p>

            <h2 className={`${HEADING} mt-8`}>Connect</h2>
            <ul className="mt-4 flex gap-3">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-full bg-surface-alt text-accent-soft transition-colors hover:bg-border-strong hover:text-primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5 fill-current"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-quick">
            <h2 id="footer-quick" className={HEADING}>
              Quick links
            </h2>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources">
            <h2 id="footer-resources" className={HEADING}>
              Resources
            </h2>
            <ul className="mt-4 space-y-3">
              {RESOURCES.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={LINK}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={HEADING}>Contact</h2>
            <ul className="mt-4 space-y-3">
              {CONTACTS.map((item) => {
                const Icon = item.icon
                const body = (
                  <>
                    <Icon
                      className="mt-0.5 size-[18px] shrink-0 text-accent-soft"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )

                return (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} className={`flex items-start gap-3 ${LINK}`}>
                        {body}
                      </a>
                    ) : (
                      <span className="flex items-start gap-3 text-sm text-muted">{body}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-[clamp(16px,4vw,40px)] py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VAC-TECH Jr. All Rights Reserved.</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={`${LINK} underline underline-offset-4`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
