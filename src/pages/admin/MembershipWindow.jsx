import { useState } from 'react'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useCreateTemplate, useTemplates } from '../../features/templates/hooks'
import {
  useCreateWindow,
  useNow,
  useUpdateWindow,
  useWindows,
} from '../../features/registrations/hooks'
import { MEMBERSHIP_FIELDS, membershipWindowSchema } from '../../features/registrations/schema'
import { windowState } from '../../features/registrations/window'
import { formatNepalDateTime, fromDateTimeInput, toDateTimeInput } from '../../lib/utils'

function fieldPreview(fields) {
  return (fields ?? []).map((field) => field.label).join(' · ')
}

function WindowForm({ window: row, templates, lastWindow, onSubmit, onCancel, submitting }) {
  // A new window picks its questions once (a saved template, the last window, or
  // the club default) and stores them as its own snapshot. Editing a window never
  // rewrites the questions already on record — only the dates and the switch.
  const [fields, setFields] = useState(() =>
    row ? (row.fields?.length ? row.fields : MEMBERSHIP_FIELDS) : MEMBERSHIP_FIELDS,
  )
  const [source, setSource] = useState('default')
  const [values, setValues] = useState({
    label: row?.label ?? '',
    opens_at: toDateTimeInput(row?.opens_at ?? new Date()),
    closes_at: toDateTimeInput(row?.closes_at ?? new Date()),
    is_open: row?.is_open ?? true,
  })
  const [error, setError] = useState(null)

  function chooseSource(event) {
    const key = event.target.value
    setSource(key)
    if (key === 'default') setFields(MEMBERSHIP_FIELDS)
    else if (key === 'last')
      setFields(lastWindow?.fields?.length ? lastWindow.fields : MEMBERSHIP_FIELDS)
    else {
      const template = (templates ?? []).find((item) => item.id === key)
      if (template) setFields(template.fields)
    }
  }

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
      fields,
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

      {!row && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="window-source" className="text-sm font-medium text-text">
            Start from
          </label>
          <select
            id="window-source"
            value={source}
            onChange={chooseSource}
            className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          >
            <option value="default">Club default questions</option>
            {(templates ?? []).map((template) => (
              <option key={template.id} value={template.id}>
                Template: {template.name}
              </option>
            ))}
            {lastWindow && <option value="last">Copy the last window</option>}
          </select>
        </div>
      )}

      <div className="rounded-sm border border-border bg-surface-alt p-3 text-xs text-muted">
        <p className="mb-1 font-medium text-text">
          {row ? 'Questions on record' : 'Questions in this window'}
        </p>
        <p>{fieldPreview(fields) || 'No questions — the club default will be used.'}</p>
        {row && (
          <p className="mt-2">
            A window's questions are set when it is created and stay fixed, so old applications keep
            their labels. Save this window as a template to reuse them.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

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
  const { data: templates } = useTemplates('membership')
  const createWindow = useCreateWindow()
  const updateWindow = useUpdateWindow()
  const createTemplate = useCreateTemplate()
  const now = useNow()
  const state = windowState(data ?? [], new Date(now))

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [templating, setTemplating] = useState(null)
  const [templateName, setTemplateName] = useState('')

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

  function saveTemplate() {
    const name = templateName.trim()
    if (name.length < 2) return
    createTemplate.mutate(
      {
        kind: 'membership',
        name,
        description: `Saved from the membership window "${templating.label ?? 'untitled'}".`,
        fields: templating.fields?.length ? templating.fields : MEMBERSHIP_FIELDS,
      },
      {
        onSuccess: () => {
          setTemplating(null)
          setTemplateName('')
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
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateWindow.mutate({ id: row.id, values: { is_open: !row.is_open } })}
          >
            {row.is_open ? 'Switch off' : 'Switch on'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTemplating(row)
              setTemplateName(row.label ? `Membership ${row.label}` : '')
            }}
          >
            Save as template
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
          templates={templates ?? []}
          lastWindow={(data ?? [])[0] ?? null}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createWindow.isPending || updateWindow.isPending}
        />
      </Modal>

      <Modal
        open={Boolean(templating)}
        onClose={() => setTemplating(null)}
        title="Save as template"
      >
        <p className="text-sm text-muted">
          Saves this window's questions as a reusable template. It does not change the window, and
          later edits to the template never change forms already in use.
        </p>
        <div className="mt-4">
          <Input
            label="Template name"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setTemplating(null)}>
            Cancel
          </Button>
          <Button
            loading={createTemplate.isPending}
            disabled={templateName.trim().length < 2}
            onClick={saveTemplate}
          >
            Save template
          </Button>
        </div>
      </Modal>
    </>
  )
}
