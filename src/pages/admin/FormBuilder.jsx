import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useEventsForAdmin } from '../../features/events/hooks'
import { useCreateForm, useFormsForAdmin, useUpdateForm } from '../../features/registrations/hooks'
import {
  FORM_TEMPLATE,
  formFieldSchema,
  registrationFormSchema,
} from '../../features/registrations/schema'
import { formatNepalDateTime, fromDateTimeInput, toDateTimeInput } from '../../lib/utils'

function FormBody({ form, events, onSubmit, onCancel, submitting }) {
  // Once answers exist the database freezes the questions, so the UI does too.
  const locked = (form?.registrationCount ?? 0) > 0

  const [eventId, setEventId] = useState(form?.event_id ?? '')
  const [included, setIncluded] = useState(
    () => new Set(form ? form.fields.map((field) => field.id) : ['full_name', 'email']),
  )
  const [required, setRequired] = useState(
    () =>
      new Set(
        form
          ? form.fields.filter((field) => field.required).map((field) => field.id)
          : ['full_name', 'email'],
      ),
  )
  const [customLabel, setCustomLabel] = useState(
    () => form?.fields.find((field) => field.id === 'question')?.label ?? 'Anything else?',
  )
  const [opensAt, setOpensAt] = useState(() => toDateTimeInput(form?.opens_at ?? new Date()))
  const [closesAt, setClosesAt] = useState(() =>
    toDateTimeInput(form?.closes_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  )
  const [error, setError] = useState(null)

  function toggle(setter, id) {
    setter((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function buildFields() {
    return FORM_TEMPLATE.filter((template) => included.has(template.id)).map((template) => ({
      id: template.id,
      label: template.id === 'question' ? customLabel.trim() || template.label : template.label,
      type: template.type,
      required: required.has(template.id),
      ...(template.options ? { options: template.options } : {}),
    }))
  }

  function submit(event) {
    event.preventDefault()

    const fields = buildFields()
    if (fields.length === 0) {
      setError('Include at least one question.')
      return
    }
    for (const field of fields) {
      const parsed = formFieldSchema.safeParse(field)
      if (!parsed.success) {
        setError(parsed.error.issues[0].message)
        return
      }
    }

    const times = registrationFormSchema.safeParse({
      event_id: eventId,
      opens_at: opensAt,
      closes_at: closesAt,
    })
    if (!times.success) {
      setError(times.error.issues[0].message)
      return
    }

    setError(null)
    onSubmit({
      event_id: eventId,
      fields,
      opens_at: fromDateTimeInput(opensAt),
      closes_at: fromDateTimeInput(closesAt),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {form ? (
        <p className="text-sm text-muted">
          Event: <span className="font-medium text-text">{form.events?.title ?? 'Untitled'}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="form-event" className="text-sm font-medium text-text">
            Event
          </label>
          <select
            id="form-event"
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          >
            <option value="">Choose an event…</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset disabled={locked} className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-text">Questions</legend>
        {locked && (
          <p className="text-xs text-warning">
            This form already has registrations, so the questions are locked. You can still change
            the dates.
          </p>
        )}
        {FORM_TEMPLATE.map((template) => (
          <div key={template.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
                checked={included.has(template.id)}
                onChange={() => toggle(setIncluded, template.id)}
              />
              {template.label}
            </label>
            <label className="flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
                checked={required.has(template.id)}
                disabled={!included.has(template.id)}
                onChange={() => toggle(setRequired, template.id)}
              />
              required
            </label>
          </div>
        ))}
      </fieldset>

      <Input
        label="Custom question text"
        value={customLabel}
        disabled={locked}
        onChange={(event) => setCustomLabel(event.target.value)}
        hint="Used for the last question in the list."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Opens"
          type="datetime-local"
          value={opensAt}
          onChange={(event) => setOpensAt(event.target.value)}
        />
        <Input
          label="Closes"
          type="datetime-local"
          value={closesAt}
          onChange={(event) => setClosesAt(event.target.value)}
        />
      </div>

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
          {form ? 'Save form' : 'Create form'}
        </Button>
      </div>
    </form>
  )
}

export default function FormBuilder() {
  const { data: forms, isPending, isError, refetch } = useFormsForAdmin()
  const events = useEventsForAdmin()
  const createForm = useCreateForm()
  const updateForm = useUpdateForm()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function save(values) {
    const options = {
      onSuccess: () => {
        setFormOpen(false)
        setEditing(null)
      },
    }
    if (editing) updateForm.mutate({ id: editing.id, values }, options)
    else createForm.mutate(values, options)
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
        <PageHeader title="Registration forms" />
        <ErrorState message="We could not load the registration forms." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    {
      key: 'event',
      label: 'Event',
      sortable: true,
      className: 'font-medium',
      render: (row) => row.events?.title ?? 'Untitled event',
      sortValue: (row) => row.events?.title ?? '',
    },
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
      key: 'registrationCount',
      label: 'Registered',
      sortable: true,
      render: (row) =>
        row.registrationCount > 0 ? (
          <Badge variant="success">{row.registrationCount}</Badge>
        ) : (
          <span className="text-muted">0</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
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
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Registration forms"
        description="One form per event. Pick the questions, set when registration opens and closes."
      />

      <DataTable
        columns={columns}
        rows={forms ?? []}
        searchText={(row) => row.events?.title ?? ''}
        searchPlaceholder="Search forms"
        emptyTitle="No registration forms yet"
        emptyDescription="Create one and the form appears on that event's page while it is open."
        toolbar={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New form
          </Button>
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit registration form' : 'New registration form'}
      >
        <FormBody
          form={editing}
          events={events.data ?? []}
          onSubmit={save}
          onCancel={() => setFormOpen(false)}
          submitting={createForm.isPending || updateForm.isPending}
        />
      </Modal>
    </>
  )
}
