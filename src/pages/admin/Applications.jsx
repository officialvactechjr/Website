import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import CsvExportButton from '../../components/shared/CsvExportButton'
import MemberForm from '../../features/members/components/MemberForm'
import TempPassword from '../../features/members/components/TempPassword'
import { useCreateMember } from '../../features/members/hooks'
import { useAuth } from '../../context/useAuth'
import { MEMBERSHIP_FIELDS } from '../../features/registrations/schema'
import {
  useApplications,
  useMarkApplicationAccountCreated,
  useUpdateApplicationStatus,
  useWindows,
} from '../../features/registrations/hooks'
import { formatNepalDateTime } from '../../lib/utils'

const STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

/** A stored answer, readable: a checkbox list joins on commas. */
function show(value) {
  if (Array.isArray(value)) return value.join(', ')
  return value == null || value === '' ? '—' : String(value)
}

/** The extra answers of one row, labelled from the window's question snapshot. */
function answerEntries(row, fields) {
  const snapshot = fields?.length ? fields : MEMBERSHIP_FIELDS
  return Object.entries(row.answers ?? {}).map(([key, value]) => ({
    id: key,
    label: snapshot.find((field) => field.id === key)?.label ?? key,
    value: show(value),
  }))
}

export default function Applications() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch, isFetching } = useApplications()
  const { data: windows } = useWindows()
  const updateStatus = useUpdateApplicationStatus()
  const markCreated = useMarkApplicationAccountCreated()
  const createMember = useCreateMember()

  const [statusFilter, setStatusFilter] = useState('')
  const [windowFilter, setWindowFilter] = useState('')
  const [viewing, setViewing] = useState(null)
  const [creating, setCreating] = useState(null)
  const [handover, setHandover] = useState(null)

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
        <PageHeader title="Membership applications" />
        <ErrorState message="We could not load the applications." onRetry={refetch} />
      </>
    )
  }

  const all = data ?? []
  const rows = all.filter(
    (row) =>
      (!statusFilter || row.status === statusFilter) &&
      (!windowFilter || row.window_id === windowFilter),
  )

  const fieldsFor = (windowId) => {
    const window = (windows ?? []).find((item) => item.id === windowId)
    return window?.fields?.length ? window.fields : MEMBERSHIP_FIELDS
  }

  const labelFor = (key, windowId) =>
    fieldsFor(windowId).find((field) => field.id === key)?.label ?? key

  // One column per answer key across the filtered rows, so a changed form never
  // breaks an export: the key is the question id, the header is its snapshot label.
  const answerKeys = [...new Set(rows.flatMap((row) => Object.keys(row.answers ?? {})))]

  const csvRows = rows.map((row) => ({
    Submitted: formatNepalDateTime(row.submitted_at),
    Name: row.full_name,
    Class: row.class ?? '',
    Section: row.section ?? '',
    Email: row.email,
    Phone: row.phone ?? '',
    Reason: row.reason ?? '',
    Status: row.status,
    'Account created': row.account_created_at ? 'yes' : 'no',
    ...Object.fromEntries(
      answerKeys.map((key) => [labelFor(key, row.window_id), show(row.answers?.[key])]),
    ),
  }))

  function createAccount(values) {
    const applicationId = creating.id
    createMember.mutate(values, {
      onSuccess: (result) => {
        setHandover(result)
        setCreating(null)
        markCreated.mutate(applicationId)
      },
    })
  }

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
    { key: 'full_name', label: 'Name', sortable: true, className: 'font-medium' },
    {
      key: 'class',
      label: 'Class',
      render: (row) => [row.class, row.section].filter(Boolean).join(' · ') || '—',
    },
    {
      key: 'email',
      label: 'Contact',
      render: (row) => (
        <span className="text-xs">
          {row.email}
          {row.phone && <span className="block text-muted">{row.phone}</span>}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <select
          aria-label={`Status for ${row.full_name}`}
          value={row.status}
          onChange={(event) =>
            updateStatus.mutate({
              id: row.id,
              status: event.target.value,
              reviewedBy: profile?.id ?? null,
            })
          }
          className="h-10 rounded-sm border border-border bg-surface px-2 text-sm text-text focus:border-primary"
        >
          {Object.entries(STATUS).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'account',
      label: 'Account',
      render: (row) => {
        if (row.account_created_at) return <Badge variant="success">Created</Badge>
        if (row.status !== 'approved') return <span className="text-muted">—</span>
        return (
          <Button variant="secondary" size="sm" onClick={() => setCreating(row)}>
            Create account
          </Button>
        )
      },
    },
    {
      key: 'answers',
      label: 'Answers',
      className: 'text-right',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setViewing(row)}>
          View answers
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Membership applications"
        description="Applications sent through the Join page. Only the club team can read these."
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="applications-status" className="text-sm font-medium text-text">
            Status
          </label>
          <select
            id="applications-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="applications-window" className="text-sm font-medium text-text">
            Window
          </label>
          <select
            id="applications-window"
            value={windowFilter}
            onChange={(event) => setWindowFilter(event.target.value)}
            className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          >
            <option value="">All windows</option>
            {(windows ?? []).map((window) => (
              <option key={window.id} value={window.id}>
                {window.label || formatNepalDateTime(window.opens_at)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        onRefresh={refetch}
        refreshing={isFetching}
        columns={columns}
        rows={rows}
        searchText={(row) => `${row.full_name} ${row.email} ${row.phone ?? ''} ${row.class ?? ''}`}
        searchPlaceholder="Search applications"
        emptyTitle="No applications yet"
        emptyDescription="Applications appear here as soon as the membership window is open."
        toolbar={<CsvExportButton rows={csvRows} filename="membership-applications.csv" />}
      />

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? `Application — ${viewing.full_name}` : 'Application'}
        size="lg"
      >
        {viewing && (
          <div className="flex flex-col gap-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Class · Section</dt>
                <dd>{[viewing.class, viewing.section].filter(Boolean).join(' · ') || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Status</dt>
                <dd>
                  <Badge variant={STATUS[viewing.status]?.variant ?? 'neutral'}>
                    {STATUS[viewing.status]?.label ?? viewing.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="break-all">{viewing.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd>{viewing.phone || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Why do you want to join?</dt>
                <dd className="whitespace-pre-wrap">{viewing.reason || '—'}</dd>
              </div>
              {answerEntries(viewing, fieldsFor(viewing.window_id)).map((entry) => (
                <div key={entry.id} className="sm:col-span-2">
                  <dt className="text-xs text-muted">{entry.label}</dt>
                  <dd className="whitespace-pre-wrap">{entry.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              Submitted {formatNepalDateTime(viewing.submitted_at)} (Nepal time).
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(creating)}
        onClose={() => setCreating(null)}
        title="Create the member account"
      >
        {creating && (
          <MemberForm
            values={{
              full_name: creating.full_name ?? '',
              email: creating.email ?? '',
              class: creating.class ?? '',
              section: creating.section ?? '',
              phone: creating.phone ?? '',
              github_url:
                typeof creating.answers?.github_url === 'string' ? creating.answers.github_url : '',
            }}
            onSubmit={createAccount}
            onCancel={() => setCreating(null)}
            submitting={createMember.isPending}
          />
        )}
      </Modal>

      {handover && <TempPassword result={handover} onClose={() => setHandover(null)} />}
    </>
  )
}
