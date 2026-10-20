import { useState } from 'react'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import BodForm from '../../features/bod/components/BodForm'
import {
  useBodMembers,
  useCreateBodMember,
  useDeleteBodMember,
  useUpdateBodMember,
} from '../../features/bod/hooks'
import { initials } from '../../lib/utils'

export default function BodAdmin() {
  // Same query (and cache entry) as the public /bod page.
  const { data, isPending, isError, refetch } = useBodMembers()
  const createMember = useCreateBodMember()
  const updateMember = useUpdateBodMember()
  const deleteMember = useDeleteBodMember()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(member) {
    setEditing(member)
    setFormOpen(true)
  }

  function save(values) {
    const options = {
      onSuccess: () => {
        setFormOpen(false)
        setEditing(null)
      },
    }
    if (editing) updateMember.mutate({ id: editing.id, values }, options)
    else createMember.mutate(values, options)
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
        <PageHeader title="Board of directors" />
        <ErrorState message="We could not load the board right now." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Member',
      sortable: true,
      render: (member) => (
        <span className="flex items-center gap-3">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt=""
              loading="lazy"
              className="size-9 shrink-0 rounded-sm border border-border object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-sm bg-surface-alt text-xs font-semibold text-muted"
            >
              {initials(member.full_name)}
            </span>
          )}
          <span className="font-medium">{member.full_name}</span>
        </span>
      ),
    },
    { key: 'position', label: 'Position', sortable: true },
    {
      key: 'term_year',
      label: 'Term',
      sortable: true,
      render: (member) => member.term_year || '—',
    },
    {
      key: 'sort_order',
      label: 'Order',
      sortable: true,
      render: (member) => <span className="font-mono text-xs text-muted">{member.sort_order}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (member) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(member)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleting(member)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Board of directors"
        description="The students shown on the public board page and on Home."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(member) => `${member.full_name} ${member.position} ${member.term_year ?? ''}`}
        searchPlaceholder="Search the board"
        emptyTitle="No board members yet"
        emptyDescription="Add the first board member and they will show up here."
        toolbar={<Button onClick={openNew}>Add member</Button>}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit board member' : 'Add board member'}
      >
        <BodForm
          member={editing}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createMember.isPending || updateMember.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleteMember.mutate(
            { id: deleting.id, photoUrl: deleting.photo_url },
            { onSuccess: () => setDeleting(null) },
          )
        }
        title="Remove this board member?"
        itemName={deleting?.full_name}
        confirmLabel="Remove"
        loading={deleteMember.isPending}
      />
    </>
  )
}
