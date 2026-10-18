import NoticeRow from './NoticeRow'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useNotices } from '../hooks'

function Rows() {
  return (
    <div className="border-b border-border" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid gap-2 border-t border-border py-5 sm:grid-cols-[130px_1fr]">
          <span className="h-4 w-24 animate-pulse rounded-sm bg-surface-alt" />
          <span className="h-4 w-3/4 animate-pulse rounded-sm bg-surface-alt" />
        </div>
      ))}
    </div>
  )
}

export default function NoticeList({ limit, emptyDescription = 'Check back soon.' }) {
  const { data, isPending, isError, refetch } = useNotices(limit ? { limit } : undefined)

  if (isPending) return <Rows />
  if (isError)
    return <ErrorState message="We could not load notices right now." onRetry={refetch} />
  if (!data?.length) return <EmptyState title="No notices yet" description={emptyDescription} />

  return (
    <div className="border-b border-border">
      {data.map((notice) => (
        <NoticeRow key={notice.id} notice={notice} />
      ))}
    </div>
  )
}
