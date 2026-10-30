import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import CsvExportButton from '../../components/shared/CsvExportButton'
import { useEventRegistrations, useFormsForAdmin } from '../../features/registrations/hooks'
import { formatNepalDateTime } from '../../lib/utils'

/** Answer columns come from the stored rows, not the current form definition, so
 *  an export still makes sense after the questions have changed. Name and email
 *  already have their own columns, so they are not repeated here. */
function answerKeys(rows) {
  return [...new Set(rows.flatMap((row) => Object.keys(row.answers ?? {})))].filter(
    (key) => key !== 'website' && key !== 'full_name' && key !== 'email',
  )
}

function labelFor(key, fields) {
  return fields?.find((field) => field.id === key)?.label ?? key
}

export default function Registrations() {
  const { data: forms, isPending, isError, refetch, isFetching } = useFormsForAdmin()
  const [formId, setFormId] = useState('')

  const chosen = (forms ?? []).find((form) => form.id === formId) ?? null
  const {
    data: registrations,
    isPending: rowsPending,
    isError: rowsError,
    refetch: rowsRefetch,
  } = useEventRegistrations(formId || undefined)

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
        <PageHeader title="Event registrations" />
        <ErrorState message="We could not load the registration forms." onRetry={refetch} />
      </>
    )
  }

  const rows = registrations ?? []
  const keys = answerKeys(rows)

  const columns = [
    {
      key: 'submitted_at',
      label: 'Sent',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted">
          {formatNepalDateTime(row.submitted_at)}
        </span>
      ),
    },
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      className: 'font-medium',
      render: (row) => row.full_name || row.answers?.full_name || '—',
    },
    { key: 'email', label: 'Email', render: (row) => row.email || row.answers?.email || '—' },
    ...keys.map((key) => ({
      key,
      label: labelFor(key, chosen?.fields),
      render: (row) => row.answers?.[key] ?? '—',
    })),
  ]

  const csvRows = rows.map((row) => ({
    Submitted: formatNepalDateTime(row.submitted_at),
    Name: row.full_name ?? '',
    Email: row.email ?? '',
    ...Object.fromEntries(
      keys.map((key) => [labelFor(key, chosen?.fields), row.answers?.[key] ?? '']),
    ),
  }))

  return (
    <>
      <PageHeader title="Event registrations" description="Pick an event to see who registered." />

      {(forms ?? []).length === 0 ? (
        <EmptyState
          title="No registration forms yet"
          description="Build a form for an event first, on the Registration forms page."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="registrations-form" className="text-sm font-medium text-text">
                Event
              </label>
              <select
                id="registrations-form"
                value={formId}
                onChange={(event) => setFormId(event.target.value)}
                className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
              >
                <option value="">Choose an event…</option>
                {(forms ?? []).map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.events?.title ?? 'Untitled event'} ({form.registrationCount} registered)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!formId && (
            <EmptyState
              title="Pick an event"
              description="Registrations for that event appear here."
            />
          )}

          {formId && rowsPending && (
            <div className="grid place-items-center py-16">
              <Spinner />
            </div>
          )}

          {formId && rowsError && (
            <ErrorState message="We could not load those registrations." onRetry={rowsRefetch} />
          )}

          {formId && !rowsPending && !rowsError && (
            <DataTable
              onRefresh={refetch}
              refreshing={isFetching}
              columns={columns}
              rows={rows}
              searchText={(row) =>
                `${row.full_name ?? ''} ${row.email ?? ''} ${Object.values(row.answers ?? {}).join(' ')}`
              }
              searchPlaceholder="Search registrations"
              emptyTitle="No registrations yet"
              emptyDescription="Nobody has registered for this event yet."
              toolbar={
                <CsvExportButton
                  rows={csvRows}
                  filename={`registrations-${(chosen?.events?.title ?? 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`}
                />
              }
            />
          )}
        </>
      )}
    </>
  )
}
