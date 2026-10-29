import { Link } from 'react-router-dom'

const GROUPS = [
  {
    title: 'Pages',
    links: [
      { to: '/notices', label: 'Notices' },
      { to: '/events', label: 'Events' },
      { to: '/projects', label: 'Projects' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/bod', label: 'Board of directors' },
    ],
  },
  {
    title: 'Club',
    links: [
      { to: '/contributors', label: 'Top contributors' },
      { to: '/members', label: 'Member list' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Members',
    links: [
      { to: '/join', label: 'Apply for membership' },
      { to: '/profile', label: 'My profile' },
      { to: '/login', label: 'Member login' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-[clamp(16px,4vw,40px)] py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold">VAC-TECH Jr.</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            The IT club of Vishwa Adarsha Academy, +2 section.
          </p>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.title} aria-labelledby={`footer-${group.title}`}>
            <h2
              id={`footer-${group.title}`}
              className="text-xs font-semibold tracking-wide text-muted uppercase"
            >
              {group.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] py-5 text-xs text-muted">
          © {new Date().getFullYear()} VAC-TECH Jr., Vishwa Adarsha Academy.
        </p>
      </div>
    </footer>
  )
}
