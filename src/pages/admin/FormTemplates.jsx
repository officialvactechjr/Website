import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useAuth } from '../../context/useAuth'
import { ADMIN_ROLES } from '../../lib/constants'
import {
  useDeleteTemplate,
  useDuplicateTemplate,
  useTemplates,
  useUpdateTemplate,
} from '../../features/templates/hooks'

const KIND = { membership: 'Membership', event: 'Event' }

export default function FormTemplates() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch } = useTemplates()
  const update = useUpdateTemplate()
  const duplicate = useDuplicateTemplate()
  const remove = useDeleteTemplate()

  const [renaming, setRenaming] = useState(null)
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(null)

  const canDelete = ADMIN_ROLES.includes(profile?.role)

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
        <PageHeader title="Form templates" />
        <ErrorState message="We could not load the templates." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true, className: 'font-medium' },
    {
      key: 'kind',
      label: 'For',
      sortable: true,
      render: (row) => (
        <Badge variant={row.kind === 'membership' ? 'gold' : 'neutral'}>{KIND[row.kind]}</Badge>
      ),
    },
    {
      key: 'fieldCount',
      label: 'Questions',
      sortable: true,
      sortValue: (row) => row.fields?.length ?? 0,
      render: (row) => row.fields?.length ?? 0,
    },
    {
      key: 'is_archived',
      label: 'State',
      render: (row) => (
        <span className={row.is_archived ? 'text-muted' : 'text-success'}>
          {row.is_archived ? 'Archived' : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRenaming(row)
              setName(row.name)
            }}
          >
            Rename
          </Button>
          <Button variant="ghost" size="sm" onClick={() => duplicate.mutate(row)}>
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => update.mutate({ id: row.id, values: { is_archived: !row.is_archived } })}
          >
            {row.is_archived ? 'Unarchive' : 'Archive'}
          </Button>
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(row)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Form templates"
        description="Reusable question lists for a membership window or an event form. Save one from a window or a form, then start the next one from it."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(row) => `${row.name} ${row.description ?? ''}`}
        searchPlaceholder="Search templates"
        emptyTitle="No templates yet"
        emptyDescription="Save one as a template from a membership window or a registration form."
      />

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename template"
        size="sm"
      >
        <Input
          label="Template name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRenaming(null)}>
            Cancel
          </Button>
          <Button
            loading={update.isPending}
            disabled={name.trim().length < 2}
            onClick={() =>
              update.mutate(
                { id: renaming.id, values: { name: name.trim() } },
                { onSuccess: () => setRenaming(null) },
              )
            }
          >
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={() => remove.mutate(confirming.id, { onSuccess: () => setConfirming(null) })}
        title="Delete this template?"
        itemName={confirming?.name}
        confirmLabel="Delete"
        loading={remove.isPending}
      />
    </>
  )
}
