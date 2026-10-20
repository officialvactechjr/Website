import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useBodMembers } from '../hooks'
import { initials } from '../../../lib/utils'

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="aspect-square animate-pulse rounded-sm bg-surface-alt" />
          <div className="mt-3.5 h-4 w-2/3 animate-pulse rounded-sm bg-surface-alt" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-sm bg-surface-alt" />
        </div>
      ))}
    </div>
  )
}

export default function BodGrid({
  limit,
  emptyDescription = 'This year’s board has not been added yet.',
}) {
  const { data, isPending, isError, refetch } = useBodMembers(limit ? { limit } : undefined)

  if (isPending) return <Skeleton />
  if (isError)
    return <ErrorState message="We could not load the board right now." onRetry={refetch} />
  if (!data?.length)
    return <EmptyState title="No board members yet" description={emptyDescription} />

  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {data.map((member) => (
        <li key={member.id}>
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={`Photo of ${member.full_name}`}
              loading="lazy"
              className="aspect-square w-full rounded-sm border border-border-strong object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="grid aspect-square w-full place-items-center rounded-sm border border-border-strong bg-surface-alt text-3xl font-semibold text-border-strong"
            >
              {initials(member.full_name)}
            </div>
          )}
          <h3 className="mt-3.5 text-[17px] font-semibold">{member.full_name}</h3>
          <p className="text-sm text-muted">{member.position}</p>
          {member.term_year && (
            <p className="mt-1 font-mono text-xs text-muted">{member.term_year}</p>
          )}
          {member.bio && <p className="mt-2 text-sm text-muted">{member.bio}</p>}
        </li>
      ))}
    </ul>
  )
}
