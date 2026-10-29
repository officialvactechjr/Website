import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useSetSuggestionRead, useSuggestions } from '../../features/suggestions/hooks'
import { formatNepalDateTime } from '../../lib/utils'

export default function SuggestionsAdmin() {
  const { data, isPending, isError, refetch } = useSuggestions()
  const markRead = useSetSuggestionRead()

  const rows = data ?? []
  const unread = rows.filter((row) => !row.is_read).length

  const columns = [
    {
      key: 'created_at',
      label: 'Received',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs whitespace-nowrap text-muted">
          {formatNepalDateTime(row.created_at)}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Suggestion',
      className: 'max-w-[42rem] whitespace-pre-wrap',
    },
    {
      key: 'is_read',
      label: 'Status',
      sortable: true,
      sortValue: (row) => (row.is_read ? 1 : 0),
      render: (row) =>
        row.is_read ? <Badge variant="neutral">Read</Badge> : <Badge variant="gold">New</Badge>,
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markRead.mutate({ id: row.id, isRead: !row.is_read })}
          disabled={markRead.isPending}
        >
          {row.is_read ? 'Mark unread' : 'Mark read'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Suggestions" description="What members sent through the suggestion box." />

      <p className="mb-4 max-w-prose text-sm text-muted">
        The writer is never shown here — not on this screen, not in an export. That is deliberate,
        and the database refuses to hand out the name even if someone asks it directly.
      </p>

      {isPending && (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load the suggestions." onRetry={refetch} />}

      {!isPending && !isError && rows.length === 0 && (
        <EmptyState
          title="No suggestions yet"
          description="Members can send one from the suggestion box on their profile menu."
        />
      )}

      {!isPending && !isError && rows.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted">
            {unread === 0
              ? 'Everything has been read.'
              : `${unread} ${unread === 1 ? 'suggestion is' : 'suggestions are'} still unread.`}
          </p>
          <DataTable
            columns={columns}
            rows={rows}
            searchText={(row) => row.message}
            searchPlaceholder="Search suggestions"
          />
        </>
      )}
    </>
  )
}
