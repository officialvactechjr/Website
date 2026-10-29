import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import CsvExportButton from '../../components/shared/CsvExportButton'
import BulkImport from '../../features/members/components/BulkImport'
import MemberForm from '../../features/members/components/MemberForm'
import TempPassword from '../../features/members/components/TempPassword'
import {
  useAccounts,
  useCreateMember,
  useResetMemberPassword,
  useSetMemberStatus,
} from '../../features/members/hooks'
import { formatDate } from '../../lib/utils'

const TEMPLATE = [
  {
    full_name: 'Sample Student',
    email: 'sample@example.com',
    class: '11',
    section: 'A',
    github_url: '',
  },
]

export default function MembersAdmin() {
  const { data, isPending, isError, refetch } = useAccounts()
  const createMember = useCreateMember()
  const resetPassword = useResetMemberPassword()
  const setStatus = useSetMemberStatus()

  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [handover, setHandover] = useState(null)
  const [confirming, setConfirming] = useState(null)

  function created(result) {
    setCreating(false)
    setHandover(result)
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
        <PageHeader title="Members" />
        <ErrorState message="We could not load the member accounts." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    { key: 'full_name', label: 'Name', sortable: true, className: 'font-medium' },
    {
      key: 'email',
      label: 'Login email',
      render: (row) => <span className="text-xs">{row.email ?? '—'}</span>,
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (row) => [row.class, row.section].filter(Boolean).join(' · ') || '—',
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <Badge variant={row.role === 'member' ? 'neutral' : 'gold'}>{row.role}</Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Added',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-muted">{formatDate(row.created_at)}</span>
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
            loading={resetPassword.isPending}
            onClick={() =>
              resetPassword.mutate(row.id, { onSuccess: (result) => setHandover(result) })
            }
          >
            Reset password
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(row)}>
            {row.is_active ? 'Deactivate' : 'Reactivate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Members"
        description="Every club account. Create one at a time or import a spreadsheet."
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(row) => `${row.full_name} ${row.email ?? ''} ${row.class ?? ''} ${row.role}`}
        searchPlaceholder="Search members"
        emptyTitle="No accounts yet"
        emptyDescription="Create the first member and hand them their password in person."
        toolbar={
          <div className="flex flex-wrap gap-3">
            <CsvExportButton
              rows={TEMPLATE}
              filename="members-template.csv"
              label="Download template"
            />
            <Button variant="secondary" onClick={() => setImporting(true)}>
              Import CSV
            </Button>
            <Button onClick={() => setCreating(true)}>New member</Button>
          </div>
        }
      />

      <Modal open={creating} onClose={() => setCreating(false)} title="Create a member account">
        <MemberForm
          onSubmit={(values) => createMember.mutate(values, { onSuccess: created })}
          onCancel={() => setCreating(false)}
          submitting={createMember.isPending}
        />
      </Modal>

      <Modal open={importing} onClose={() => setImporting(false)} title="Import members from CSV">
        <BulkImport
          onDone={(result) => {
            setImporting(false)
            setHandover(result)
          }}
          onCancel={() => setImporting(false)}
        />
      </Modal>

      {handover && <TempPassword result={handover} onClose={() => setHandover(null)} />}

      <ConfirmDialog
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={() =>
          setStatus.mutate(
            { userId: confirming.id, isActive: !confirming.is_active },
            { onSuccess: () => setConfirming(null) },
          )
        }
        title={confirming?.is_active ? 'Deactivate this account?' : 'Reactivate this account?'}
        itemName={confirming?.full_name}
        confirmLabel={confirming?.is_active ? 'Deactivate' : 'Reactivate'}
        loading={setStatus.isPending}
      />
    </>
  )
}
