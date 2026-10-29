import { useState } from 'react'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import {
  useCreateWindow,
  useNow,
  useUpdateWindow,
  useWindows,
} from '../../features/registrations/hooks'
import { membershipWindowSchema } from '../../features/registrations/schema'
import { windowState } from '../../features/registrations/window'
import { formatNepalDateTime, fromDateTimeInput, toDateTimeInput } from '../../lib/utils'

function WindowForm({ window: row, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({
    label: row?.label ?? '',
    opens_at: toDateTimeInput(row?.opens_at ?? new Date()),
    closes_at: toDateTimeInput(row?.closes_at ?? new Date()),
    is_open: row?.is_open ?? true,
  })
  const [error, setError] = useState(null)

  function submit(event) {
    event.preventDefault()
    const parsed = membershipWindowSchema.safeParse(values)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError(null)
    onSubmit({
      ...parsed.data,
      label: parsed.data.label || null,
      opens_at: fromDateTimeInput(parsed.data.opens_at),
      closes_at: fromDateTimeInput(parsed.data.closes_at),
    })
  }

  const set = (key) => (event) =>
    setValues((previous) => ({
      ...previous,
      [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }))

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Label"
        hint="For example: Autumn 2026"
        value={values.label}
        onChange={set('label')}
      />
      <Input
        label="Opens"
        type="datetime-local"
        value={values.opens_at}
        onChange={set('opens_at')}
      />
      <Input
        label="Closes"
        type="datetime-local"
        value={values.closes_at}
        onChange={set('closes_at')}
      />
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          checked={values.is_open}
          onChange={set('is_open')}
        />
        Registration is switched on
      </label>
      <p className="text-xs text-muted">
        Both must agree: the switch on, and the current time between the two dates. Turn the switch
        off to close registration immediately.
      </p>

      {error && (
        <p role="alert" className="rounded-sm border border-danger px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {row ? 'Save window' : 'Create window'}
        </Button>
      </div>
    </form>
  )
}

export default function MembershipWindow() {
  const { data, isPending, isError, refetch } = useWindows()
  const createWindow = useCreateWindow()
  const updateWindow = useUpdateWindow()
  const now = useNow()
  const state = windowState(data ?? [], new Date(now))

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function save(values) {
    const options = {
      onSuccess: () => {
        setFormOpen(false)
        setEditing(null)
      },
    }
    if (editing) updateWindow.mutate({ id: editing.id, values }, options)
    else createWindow.mutate(values, options)
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
        <PageHeader title="Membership window" />
        <ErrorState message="We could not load the membership windows." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    { key: 'label', label: 'Label', sortable: true, render: (row) => row.label || '—' },
    {
      key: 'opens_at',
      label: 'Opens',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted">{formatNepalDateTime(row.opens_at)}</span>
      ),
    },
    {
      key: 'closes_at',
      label: 'Closes',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted">{formatNepalDateTime(row.closes_at)}</span>
      ),
    },
    {
      key: 'is_open',
      label: 'State',
      render: (row) => (
        <span className={row.is_open ? 'text-success' : 'text-muted'}>
          {row.is_open ? 'Switched on' : 'Switched off'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateWindow.mutate({ id: row.id, values: { is_open: !row.is_open } })}
          >
            {row.is_open ? 'Switch off' : 'Switch on'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditing(row)
              setFormOpen(true)
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Membership window"
        description="Applications are accepted only when a window is switched on and today is between its dates."
      />

      <p className="mb-6 rounded-sm border border-border bg-surface p-4 text-sm text-muted">
        {state.open
          ? `Open now — closes ${formatNepalDateTime(state.open.closes_at)} (Nepal time).`
          : 'Registration is closed right now.'}
      </p>

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(row) => row.label ?? ''}
        searchPlaceholder="Search windows"
        emptyTitle="No windows yet"
        emptyDescription="Create a window and membership applications open automatically."
        toolbar={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New window
          </Button>
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit window' : 'New membership window'}
      >
        <WindowForm
          window={editing}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createWindow.isPending || updateWindow.isPending}
        />
      </Modal>
    </>
  )
}
