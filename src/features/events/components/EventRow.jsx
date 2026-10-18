import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function EventRow({ event }) {
  const starts = new Date(event.starts_at)

  return (
    <Link
      to={`/events/${event.id}`}
      className="group grid grid-cols-[60px_minmax(0,1fr)] items-center gap-x-4 border-t border-border py-5 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-x-[22px]"
    >
      <span className="font-mono">
        <b className="block text-[34px] leading-none font-medium text-primary-text">
          {format(starts, 'dd')}
        </b>
        <span className="text-xs text-muted uppercase">{format(starts, 'MMM yyyy')}</span>
      </span>
      <span>
        <span className="block text-lg font-semibold transition-colors group-hover:text-primary-text">
          {event.title}
        </span>
        {(event.description || event.location) && (
          <span className="mt-1 block text-sm text-muted">
            {event.description}
            {event.description && event.location ? ' · ' : ''}
            {event.location}
          </span>
        )}
      </span>
    </Link>
  )
}
