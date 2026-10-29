import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useMembers } from '../hooks'
import { initials } from '../../../lib/utils'

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-sm border border-border bg-surface p-4"
        >
          <span className="size-11 shrink-0 animate-pulse rounded-full bg-surface-alt" />
          <span className="space-y-2">
            <span className="block h-4 w-32 animate-pulse rounded-sm bg-surface-alt" />
            <span className="block h-3 w-20 animate-pulse rounded-sm bg-surface-alt" />
          </span>
        </div>
      ))}
    </div>
  )
}

// Only name, class, section and GitHub come out of `public_members`.
export default function MemberGrid({
  limit,
  emptyDescription = 'The member list has not been published yet.',
}) {
  const { data, isPending, isError, refetch } = useMembers(limit ? { limit } : undefined)

  if (isPending) return <Skeleton />
  if (isError)
    return <ErrorState message="We could not load the member list right now." onRetry={refetch} />
  if (!data?.length) return <EmptyState title="No members yet" description={emptyDescription} />

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Index keys: the view intentionally does not expose a member id. */}
      {data.map((member, index) => (
        <li
          key={index}
          className="flex items-center gap-4 rounded-sm border border-border bg-surface p-4"
        >
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="size-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-alt text-sm font-semibold text-muted"
            >
              {initials(member.full_name)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate font-medium">{member.full_name}</p>
            <p className="text-sm text-muted">
              {member.class ? `Class ${member.class}` : 'Class not set'}
              {member.section ? ` · ${member.section}` : ''}
            </p>
            {member.github_url && (
              <a
                href={member.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary-text hover:underline"
              >
                GitHub
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
