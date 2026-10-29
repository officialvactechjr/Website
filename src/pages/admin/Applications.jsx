import Badge from '../../components/ui/Badge'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import CsvExportButton from '../../components/shared/CsvExportButton'
import { useAuth } from '../../context/useAuth'
import { useApplications, useUpdateApplicationStatus } from '../../features/registrations/hooks'
import { formatNepalDateTime } from '../../lib/utils'

const STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
}

/** Everything the CSV needs, flat. */
function csvRows(applications) {
  return applications.map((row) => ({
    Submitted: formatNepalDateTime(row.submitted_at),
    Name: row.full_name,
    Class: row.class ?? '',
    Section: row.section ?? '',
    Email: row.email,
    Phone: row.phone ?? '',
    Reason: row.reason ?? '',
    Status: row.status,
  }))
}

export default function Applications() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch } = useApplications()
  const updateStatus = useUpdateApplicationStatus()
  const rows = data ?? []

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
      key: 'current',
      label: 'Now',
      render: (row) => (
        <Badge variant={STATUS[row.status]?.variant ?? 'neutral'}>
          {STATUS[row.status]?.label ?? row.status}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Membership applications"
        description="Applications sent through the Join page. Only the club team can read these."
      />

      <DataTable
        columns={columns}
        rows={rows}
        searchText={(row) => `${row.full_name} ${row.email} ${row.phone ?? ''} ${row.class ?? ''}`}
        searchPlaceholder="Search applications"
        emptyTitle="No applications yet"
        emptyDescription="Applications appear here as soon as the membership window is open."
        toolbar={<CsvExportButton rows={csvRows(rows)} filename="membership-applications.csv" />}
      />
    </>
  )
}
