import { useState } from 'react'
import { format } from 'date-fns'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import EventForm from '../../features/events/components/EventForm'
import {
  useCreateEvent,
  useDeleteEvent,
  useEventsForAdmin,
  useUpdateEvent,
} from '../../features/events/hooks'

const STATUS = {
  draft: { label: 'Draft', variant: 'neutral' },
  published: { label: 'Published', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

export default function EventsAdmin() {
  const { data, isPending, isError, refetch, isFetching } = useEventsForAdmin()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(event) {
    setEditing(event)
    setFormOpen(true)
  }

  function save(values) {
    const options = {
      onSuccess: () => {
        setFormOpen(false)
        setEditing(null)
      },
    }
    if (editing) updateEvent.mutate({ id: editing.id, values }, options)
    else createEvent.mutate(values, options)
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
        <PageHeader title="Events" />
        <ErrorState message="We could not load events right now." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    { key: 'title', label: 'Title', sortable: true, className: 'font-medium' },
    {
      key: 'starts_at',
      label: 'Starts',
      sortable: true,
      render: (event) => (
        <span className="font-mono text-xs text-muted">
          {format(new Date(event.starts_at), 'dd MMM yyyy, h:mm a')}
        </span>
      ),
    },
    { key: 'location', label: 'Location', render: (event) => event.location || '—' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (event) => (
        <Badge variant={STATUS[event.status]?.variant ?? 'neutral'}>
          {STATUS[event.status]?.label ?? event.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (event) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(event)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(event)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Events" description="Workshops and events, upcoming and past." />

      <DataTable
        onRefresh={refetch}
        refreshing={isFetching}
        columns={columns}
        rows={data ?? []}
        searchText={(event) => `${event.title} ${event.location ?? ''}`}
        searchPlaceholder="Search events"
        emptyTitle="No events yet"
        emptyDescription="Create the first event and it will show up here."
        toolbar={<Button onClick={openNew}>New event</Button>}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit event' : 'New event'}
      >
        <EventForm
          event={editing}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createEvent.isPending || updateEvent.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteEvent.mutate(
            { id: deleting.id, coverImage: deleting.cover_image },
            { onSuccess: () => setDeleting(null) },
          )
        }
        title="Delete this event?"
        itemName={deleting?.title}
        loading={deleteEvent.isPending}
      />
    </>
  )
}
