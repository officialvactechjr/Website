import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/useAuth'
import { useDashboard } from '../../features/dashboard/hooks'
import { formatDate } from '../../lib/utils'

const TILES = [
  { key: 'notices', label: 'Notices', to: '/admin/notices' },
  { key: 'events', label: 'Events', to: '/admin/events' },
  { key: 'gallery', label: 'Gallery photos', to: '/admin/gallery' },
  { key: 'bod', label: 'Board members', to: '/admin/bod' },
]

function Tile({ label, value, to }) {
  return (
    <Link
      to={to}
      className="rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary"
    >
      <p className="font-mono text-3xl tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Link>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch } = useDashboard()

  return (
    <>
      <PageHeader
        title={`Hello, ${profile?.full_name ?? 'there'}`}
        description="Everything the club publishes, in one place."
      />

      {isPending && (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load the dashboard." onRetry={refetch} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TILES.map((tile) => (
              <Tile key={tile.key} label={tile.label} value={data.counts[tile.key]} to={tile.to} />
            ))}
          </div>

          <Card className="mt-6">
            <p className="text-sm text-muted">
              <span className="font-mono text-2xl text-text tabular-nums">
                {data.counts.pendingProjects}
              </span>{' '}
              project{data.counts.pendingProjects === 1 ? '' : 's'} waiting for review.
            </p>
          </Card>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold">Recent notices</h2>
              <Link
                to="/admin/notices"
                className="text-sm font-semibold text-primary-text hover:underline"
              >
                Manage notices
              </Link>
            </div>

            {data.recentNotices.length === 0 ? (
              <EmptyState
                title="No notices yet"
                description="Publish the first notice and it will show up here."
              />
            ) : (
              <ul className="rounded-sm border border-border bg-surface">
                {data.recentNotices.map((notice) => (
                  <li
                    key={notice.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-3 first:border-t-0"
                  >
                    <span className="font-medium">{notice.title}</span>
                    <span className="font-mono text-xs text-muted">
                      {formatDate(notice.published_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  )
}
