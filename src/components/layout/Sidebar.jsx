import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

// The active section keeps its fill plus a 1px gold hairline at the left edge and
// a gold icon, so the eye finds it without a scan.
const linkClass = (active) =>
  cn(
    'flex items-center gap-3 rounded-sm border-l px-3 py-2 text-sm font-medium transition-colors ease-assemble',
    active
      ? 'border-l-primary bg-surface-alt text-text'
      : 'border-l-transparent text-muted hover:text-text',
  )

/**
 * Top-level navigation only: one link per admin section, at every role. A
 * section's own pages are tabs in the contextual toolbar (`AdminLayout`), so
 * nothing here is an action and nothing here nests.
 *
 * `sections` is `[{ label, to, icon, active }]`, computed by `AdminLayout` —
 * `active` means "the URL is somewhere inside this section", which a `NavLink`
 * cannot express with a single `to`.
 */
export default function Sidebar({ sections, onNavigate }) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-0.5">
      {sections.map((section) => (
        <Link
          key={section.label}
          to={section.to}
          onClick={onNavigate}
          aria-current={section.active ? 'page' : undefined}
          className={linkClass(section.active)}
        >
          <section.icon
            className={cn('size-4 shrink-0', section.active && 'text-primary')}
            aria-hidden="true"
          />
          {section.label}
        </Link>
      ))}
    </nav>
  )
}
