import EventRow from './EventRow'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useEvents } from '../hooks'

function Rows() {
  return (
    <div className="border-b border-border" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-[60px_1fr] gap-4 border-t border-border py-5">
          <span className="h-10 w-12 animate-pulse rounded-sm bg-surface-alt" />
          <div className="space-y-2">
            <span className="block h-4 w-1/3 animate-pulse rounded-sm bg-surface-alt" />
            <span className="block h-4 w-2/3 animate-pulse rounded-sm bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function EventList({
  limit,
  upcoming = true,
  emptyDescription = 'Check back soon.',
}) {
  const { data, isPending, isError, refetch } = useEvents({ upcoming, limit })

  if (isPending) return <Rows />
  if (isError) return <ErrorState message="We could not load events right now." onRetry={refetch} />
  if (!data?.length) return <EmptyState title="No events yet" description={emptyDescription} />

  return (
    <div className="border-b border-border">
      {data.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  )
}
