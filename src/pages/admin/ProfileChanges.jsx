import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import Textarea from '../../components/ui/Textarea'
import { useAuth } from '../../context/useAuth'
import {
  useApplyChangeRequest,
  useChangeRequests,
  useRejectChangeRequest,
} from '../../features/members/hooks'
import { formatNepalDateTime } from '../../lib/utils'

const STATUS = {
  pending: { label: 'Waiting', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

export default function ProfileChanges() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch } = useChangeRequests()
  const apply = useApplyChangeRequest()
  const reject = useRejectChangeRequest()

  const [rejecting, setRejecting] = useState(null)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState(null)

  function confirmReject() {
    if (note.trim().length < 3) {
      setNoteError('Write a short reason so the member knows why.')
      return
    }
    reject.mutate(
      { id: rejecting.id, reviewerId: profile?.id ?? null, note: note.trim() },
      {
        onSuccess: () => {
          setRejecting(null)
          setNote('')
          setNoteError(null)
        },
      },
    )
  }

  if (isPending) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Profile changes" />
        <ErrorState message="We could not load the requests." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    {
      key: 'created_at',
      label: 'Asked',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted">{formatNepalDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'member_id',
      label: 'Member',
      sortable: true,
      className: 'font-medium',
      sortValue: (row) => row.profiles?.full_name ?? '',
      render: (row) => row.profiles?.full_name ?? 'Unknown member',
    },
    { key: 'field', label: 'Field', sortable: true },
    {
      key: 'change',
      label: 'Change',
      render: (row) => (
        <span className="text-xs">
          <span className="text-muted line-through">{row.old_value || 'empty'}</span>
          {' → '}
          <span className="font-medium text-text">{row.new_value}</span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={STATUS[row.status]?.variant ?? 'neutral'}>
          {STATUS[row.status]?.label ?? row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" loading={apply.isPending} onClick={() => apply.mutate(row.id)}>
              Approve
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setRejecting(row)}>
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted">{row.review_note ?? '—'}</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Profile changes"
        description="Members ask here for changes they cannot make themselves. Approving an email also updates their login."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(row) => `${row.profiles?.full_name ?? ''} ${row.field} ${row.new_value}`}
        searchPlaceholder="Search requests"
        emptyTitle="No requests yet"
        emptyDescription="Requests appear here when members ask for a change."
      />

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this request?"
      >
        <p className="text-sm text-muted">
          {rejecting?.profiles?.full_name ?? 'This member'} keeps their current{' '}
          <span className="font-mono text-xs">{rejecting?.field}</span>.
        </p>
        <div className="mt-4">
          <Textarea
            label="Reason"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={noteError}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setRejecting(null)}
            disabled={reject.isPending}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject} loading={reject.isPending}>
            Reject
          </Button>
        </div>
      </Modal>
    </>
  )
}
