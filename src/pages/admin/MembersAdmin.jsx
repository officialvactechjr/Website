import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import CsvExportButton from '../../components/shared/CsvExportButton'
import MemberForm from '../../features/members/components/MemberForm'
import ResetPasswordDialog from '../../features/members/components/ResetPasswordDialog'
import TempPassword from '../../features/members/components/TempPassword'
import {
  useAccounts,
  useCreateMember,
  useResetMemberPassword,
  useSetMemberStatus,
} from '../../features/members/hooks'
import { cn, formatDate } from '../../lib/utils'

// The columns the bulk-import CSV expects, in order. `password` is optional.
const TEMPLATE = [
  {
    full_name: 'Sample Student',
    email: 'sample@example.com',
    class: '11',
    section: 'A',
    phone: '',
    github_url: '',
    password: '',
  },
]

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' },
]

export default function MembersAdmin() {
  const { data, isPending, isError, refetch } = useAccounts('member')
  const createMember = useCreateMember()
  const resetPassword = useResetMemberPassword()
  const setStatus = useSetMemberStatus()

  const [tab, setTab] = useState('all')
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState(null)
  const [handover, setHandover] = useState(null)
  const [confirming, setConfirming] = useState(null)

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

  const rows = (data ?? []).filter((row) =>
    tab === 'all' ? true : tab === 'active' ? row.is_active : !row.is_active,
  )

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
          <Button variant="ghost" size="sm" onClick={() => setResetting(row)}>
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
        description="Member accounts only. Staff accounts live on the Staff page."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            aria-pressed={tab === item.value}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ease-assemble',
              tab === item.value
                ? 'border-primary text-text'
                : 'border-border-strong text-muted hover:text-text',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchText={(row) => `${row.full_name} ${row.email ?? ''} ${row.class ?? ''}`}
        searchPlaceholder="Search members"
        emptyTitle="No member accounts yet"
        emptyDescription="Create one, or import a list, and hand out the passwords in person."
        toolbar={
          <div className="flex flex-wrap gap-3">
            <CsvExportButton
              rows={TEMPLATE}
              filename="members-template.csv"
              label="Download template"
            />
            <Button as={Link} to="/admin/members/import" variant="secondary">
              Add many members
            </Button>
            <Button onClick={() => setCreating(true)}>New member</Button>
          </div>
        }
      />

      <Modal open={creating} onClose={() => setCreating(false)} title="Create a member account">
        <MemberForm
          onSubmit={(values) =>
            createMember.mutate(values, {
              onSuccess: (result) => {
                setCreating(false)
                setHandover({ ...result, full_name: values.full_name })
              },
            })
          }
          onCancel={() => setCreating(false)}
          submitting={createMember.isPending}
        />
      </Modal>

      <Modal
        open={Boolean(resetting)}
        onClose={() => setResetting(null)}
        title="Reset this password"
      >
        {resetting && (
          <ResetPasswordDialog
            account={resetting}
            onSubmit={(values) =>
              resetPassword.mutate(values, {
                onSuccess: (result) => {
                  setResetting(null)
                  setHandover(result)
                },
              })
            }
            onCancel={() => setResetting(null)}
            submitting={resetPassword.isPending}
          />
        )}
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
