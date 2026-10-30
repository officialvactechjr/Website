import { Link } from 'react-router-dom'
import { CalendarDays, Image } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import CenterHeading from '../../../components/layout/CenterHeading'
import Section from '../../../components/layout/Section'
import HorizontalMarquee from '../../../components/shared/HorizontalMarquee'
import { formatNepalDateTime } from '../../../lib/utils'
import { useHomeEvents } from '../hooks'
import { useFormForEvent } from '../../registrations/hooks'
import { formState } from '../../registrations/window'

// The Past strip card carries Past or Cancelled; an upcoming card always Upcoming.
function pastBadge(event) {
  return event.status === 'cancelled'
    ? { label: 'Cancelled', variant: 'danger' }
    : { label: 'Past', variant: 'neutral' }
}

function Cover({ event }) {
  return (
    <span className="relative block aspect-video overflow-hidden bg-surface-alt">
      {event.cover_image ? (
        <img
          src={event.cover_image}
          alt=""
          width={640}
          height={360}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <span className="grid size-full place-items-center text-muted" aria-hidden="true">
          <Image className="size-7" />
        </span>
      )}
    </span>
  )
}

function Meta({ event }) {
  return (
    <span className="mt-auto flex items-center gap-2 pt-1 font-mono text-xs text-muted">
      <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
      {formatNepalDateTime(event.starts_at)}
    </span>
  )
}

// The moving strip card — unchanged.
function PastCard({ event }) {
  const badge = pastBadge(event)

  return (
    <li className="w-[min(80vw,320px)] shrink-0">
      <Link
        to={`/events/${event.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface transition-colors hover:border-primary"
      >
        <Cover event={event} />
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </span>
          <span className="line-clamp-2 font-semibold text-text group-hover:text-primary-text">
            {event.title}
          </span>
          {event.description && (
            <span className="line-clamp-3 text-sm text-muted">{event.description}</span>
          )}
          <Meta event={event} />
        </span>
      </Link>
    </li>
  )
}

// A static grid card: Upcoming badge, and a Register link when its form is open.
function UpcomingCard({ event }) {
  const { data: form } = useFormForEvent(event.id)
  const registerOpen = formState(form, event.status) === 'open'

  return (
    <li className="flex h-full flex-col overflow-hidden rounded-sm border border-border bg-surface">
      <Cover event={event} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <Badge variant="gold">Upcoming</Badge>
        </div>
        <p className="line-clamp-2 font-semibold text-text">{event.title}</p>
        {event.description && (
          <p className="line-clamp-3 text-sm text-muted">{event.description}</p>
        )}
        <Meta event={event} />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            to={`/events/${event.id}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            View details
          </Link>
          {registerOpen && (
            <Link
              to={`/events/${event.id}`}
              className="text-sm font-semibold text-primary-text hover:underline"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </li>
  )
}

function Skeleton() {
  return (
    <ul className="flex gap-4 overflow-hidden" aria-hidden="true">
      {[0, 1, 2].map((card) => (
        <li key={card} className="w-[min(80vw,320px)] shrink-0">
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <span className="block aspect-video animate-pulse bg-surface-alt" />
            <div className="space-y-2 p-4">
              <span className="block h-5 w-20 animate-pulse rounded-full bg-surface-alt" />
              <span className="block h-4 w-3/4 animate-pulse rounded-sm bg-surface-alt" />
              <span className="block h-4 w-1/2 animate-pulse rounded-sm bg-surface-alt" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

const SEE_ALL = (
  <div className="mt-8 flex justify-center">
    <Button as={Link} to="/events" variant="outline">
      See all events
    </Button>
  </div>
)

/**
 * The Home events block: an "Upcoming events" grid (published, soonest first, at
 * most 4) above a "Past events" strip (published or cancelled, most recent first,
 * at most 12). A section with nothing to show is not rendered at all — and when
 * both are empty one friendly message stands in. Data comes from the events
 * feature, never Supabase here.
 */
export default function EventStrip() {
  const { data, isPending, isError, refetch } = useHomeEvents()

  if (isPending)
    return (
      <Section className="border-b border-border">
        <Skeleton />
      </Section>
    )
  if (isError)
    return (
      <Section className="border-b border-border">
        <ErrorState message="We could not load events right now." onRetry={refetch} />
      </Section>
    )

  const upcoming = data?.upcoming ?? []
  const past = data?.past ?? []
  const hasUpcoming = upcoming.length > 0
  const hasPast = past.length > 0

  if (!hasUpcoming && !hasPast) {
    return (
      <Section className="border-b border-border">
        <CenterHeading
          title="Events"
          description="What the club is running next, and what it has already done."
        />
        <EmptyState title="No events yet" description="Check back soon for the next one." />
        {SEE_ALL}
      </Section>
    )
  }

  return (
    <>
      {hasUpcoming && (
        <Section className="border-b border-border">
          <CenterHeading
            title="Upcoming events"
            description="What the club is running next — save the date."
          />
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {upcoming.map((event) => (
              <UpcomingCard key={event.id} event={event} />
            ))}
          </ul>
          {!hasPast && SEE_ALL}
        </Section>
      )}

      {hasPast && (
        <Section className="border-b border-border">
          <CenterHeading title="Past events" description="What the club has already done." />
          <HorizontalMarquee
            ariaLabel="Past events"
            showPause={false}
            items={past.map((event) => (
              <PastCard key={event.id} event={event} />
            ))}
          />
          {SEE_ALL}
        </Section>
      )}
    </>
  )
}
