import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

export default function Sidebar({ items, onNavigate }) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-surface-alt text-text' : 'text-muted hover:text-text',
            )
          }
        >
          {item.icon && <item.icon className="size-4 shrink-0" aria-hidden="true" />}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
