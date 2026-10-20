import { useState } from 'react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import NoticeForm from '../../features/notices/components/NoticeForm'
import {
  useCreateNotice,
  useDeleteNotice,
  useNoticesForAdmin,
  useUpdateNotice,
} from '../../features/notices/hooks'
import { formatDate } from '../../lib/utils'

export default function NoticesAdmin() {
  const { data, isPending, isError, refetch } = useNoticesForAdmin()
  const createNotice = useCreateNotice()
  const updateNotice = useUpdateNotice()
  const deleteNotice = useDeleteNotice()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(notice) {
    setEditing(notice)
    setFormOpen(true)
  }

  function save(values) {
    const options = {
      onSuccess: () => {
        setFormOpen(false)
        setEditing(null)
      },
    }
    if (editing) updateNotice.mutate({ id: editing.id, values }, options)
    else createNotice.mutate(values, options)
  }

  function togglePin(notice) {
    updateNotice.mutate({ id: notice.id, values: { is_pinned: !notice.is_pinned } })
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
        <PageHeader title="Notices" />
        <ErrorState message="We could not load notices right now." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    { key: 'title', label: 'Title', sortable: true, className: 'font-medium' },
    {
      key: 'published_at',
      label: 'Publish date',
      sortable: true,
      render: (notice) => (
        <span className="font-mono text-xs text-muted">{formatDate(notice.published_at)}</span>
      ),
    },
    {
      key: 'is_pinned',
      label: 'Pinned',
      render: (notice) => (notice.is_pinned ? <Badge variant="gold">Pinned</Badge> : null),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (notice) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => togglePin(notice)}>
            {notice.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => openEdit(notice)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(notice)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Notices"
        description="Announcements shown on the public notices page and on Home."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(notice) => notice.title}
        searchPlaceholder="Search notices"
        emptyTitle="No notices yet"
        emptyDescription="Publish the first notice and it will show up here."
        toolbar={<Button onClick={openNew}>New notice</Button>}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit notice' : 'New notice'}
      >
        <NoticeForm
          notice={editing}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createNotice.isPending || updateNotice.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteNotice.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Delete this notice?"
        itemName={deleting?.title}
        loading={deleteNotice.isPending}
      />
    </>
  )
}
