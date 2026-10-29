import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ErrorState from '../../components/ui/ErrorState'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import EventRegistration from '../../features/registrations/components/EventRegistration'
import { useEvent } from '../../features/events/hooks'

export default function EventDetail() {
  const { id } = useParams()
  const { data, isPending, isError, refetch } = useEvent(id)

  return (
    <Section tight>
      <Breadcrumbs
        items={[{ label: 'Events', to: '/events' }, { label: data?.title ?? 'Event' }]}
      />

      {isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState message="We could not load this event." onRetry={refetch} />
        </div>
      )}

      {data && (
        <article className="mt-6">
          {data.cover_image && (
            <img
              src={data.cover_image}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              className="aspect-video w-full rounded-sm border border-border object-cover"
            />
          )}

          <h1 className="mt-6 max-w-prose text-2xl font-semibold text-balance sm:text-3xl">
            {data.title}
          </h1>

          {data.status === 'cancelled' && (
            <p className="mt-3">
              <Badge variant="danger">Cancelled</Badge>
            </p>
          )}

          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <time dateTime={data.starts_at} className="font-mono">
              {format(new Date(data.starts_at), 'dd MMM yyyy, h:mm a')}
            </time>
            {data.ends_at && (
              <time dateTime={data.ends_at} className="font-mono">
                to {format(new Date(data.ends_at), 'h:mm a')}
              </time>
            )}
            {data.location && <span>· {data.location}</span>}
          </p>

          {data.description && (
            <p className="mt-5 max-w-prose whitespace-pre-line text-muted">{data.description}</p>
          )}

          <div className="mt-8">
            <EventRegistration eventId={data.id} eventStatus={data.status} />
          </div>
        </article>
      )}
    </Section>
  )
}
