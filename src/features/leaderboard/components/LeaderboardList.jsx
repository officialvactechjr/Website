import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useLeaderboard } from '../hooks'
import { cn } from '../../../lib/utils'

function Skeleton() {
  return (
    <div className="rounded-sm border border-border bg-surface py-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-t border-border px-[22px] py-3.5 first:border-t-0"
        >
          <span className="h-4 w-4 animate-pulse rounded-sm bg-surface-alt" />
          <span className="h-4 w-1/2 animate-pulse rounded-sm bg-surface-alt" />
          <span className="h-4 w-8 animate-pulse rounded-sm bg-surface-alt" />
        </div>
      ))}
    </div>
  )
}

export default function LeaderboardList({
  limit,
  emptyDescription = 'No points have been given out yet.',
}) {
  const { data, isPending, isError, refetch } = useLeaderboard(limit ? { limit } : undefined)

  if (isPending) return <Skeleton />
  if (isError)
    return <ErrorState message="We could not load the ranking right now." onRetry={refetch} />
  if (!data?.length)
    return <EmptyState title="No contributors yet" description={emptyDescription} />

  return (
    <ol className="rounded-sm border border-border bg-surface py-1.5">
      {/* Index keys: the view intentionally does not expose a member id. */}
      {data.map((row, index) => (
        <li
          key={index}
          className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-[22px] py-3.5 first:border-t-0"
        >
          <span
            className={cn('font-mono text-sm', index === 0 ? 'text-primary-text' : 'text-muted')}
          >
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{row.full_name}</span>
            {row.class && (
              <small className="block text-xs font-normal text-muted">Class {row.class}</small>
            )}
          </span>
          <span className="font-mono text-sm tabular-nums">{row.total_points}</span>
        </li>
      ))}
    </ol>
  )
}
