import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/useAuth'
import { useChangeRole } from '../../features/accounts/hooks'
import { useAccounts } from '../../features/members/hooks'

// `super_admin` is deliberately missing: it is handed over in person, never set
// from a screen, and the Edge Function refuses it as well.
const ASSIGNABLE = [
  { value: 'member', label: 'Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

const ROLE_LABEL = {
  member: 'Member',
  manager: 'Manager',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export default function Roles() {
  const { profile } = useAuth()
  const accounts = useAccounts()
  const change = useChangeRole()
  const [pending, setPending] = useState(null)

  const rows = accounts.data ?? []

  const columns = [
    {
      key: 'full_name',
      label: 'Account',
      sortable: true,
      className: 'font-medium',
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.full_name}</span>
          <span className="text-xs text-muted">{row.email ?? 'no email on file'}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <Badge variant={row.role === 'member' ? 'neutral' : 'gold'}>{ROLE_LABEL[row.role]}</Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Account',
      sortable: true,
      sortValue: (row) => (row.is_active ? 1 : 0),
      render: (row) =>
        row.is_active ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Deactivated</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Set role',
      className: 'text-right',
      render: (row) => {
        const locked = row.role === 'super_admin' || row.id === profile.id

        if (locked) {
          return (
            <span className="text-xs text-muted">
              {row.id === profile.id ? 'Your own account' : 'Handled in person'}
            </span>
          )
        }

        return (
          <select
            aria-label={`Role for ${row.full_name}`}
            value={row.role}
            onChange={(event) =>
              setPending({ id: row.id, full_name: row.full_name, role: event.target.value })
            }
            className="h-10 rounded-sm border border-border bg-surface px-2 text-sm text-text focus:border-primary"
          >
            {ASSIGNABLE.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Roles" description="Who can manage content, accounts and settings." />

      <p className="mb-4 max-w-prose text-sm text-muted">
        Super Admin accounts are handed over in person and are never changed from this screen. You
        also cannot change your own role. Removing the last Super Admin is blocked by the database.
      </p>

      {accounts.isPending && (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      )}

      {accounts.isError && (
        <ErrorState message="We could not load the accounts." onRetry={accounts.refetch} />
      )}

      {!accounts.isPending && !accounts.isError && rows.length === 0 && (
        <EmptyState title="No accounts yet" description="Create the first member account first." />
      )}

      {!accounts.isPending && !accounts.isError && rows.length > 0 && (
        <DataTable
          columns={columns}
          rows={rows}
          searchText={(row) => `${row.full_name} ${row.email ?? ''}`}
          searchPlaceholder="Search accounts"
        />
      )}

      <Modal open={Boolean(pending)} onClose={() => setPending(null)} title="Change this role?">
        {pending && (
          <>
            <p className="text-sm text-muted">
              <span className="font-medium text-text">{pending.full_name}</span> becomes{' '}
              <span className="font-medium text-text">{ROLE_LABEL[pending.role]}</span>. It takes
              effect the next time their account is read, and they keep their password.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setPending(null)}
                disabled={change.isPending}
              >
                Cancel
              </Button>
              <Button
                loading={change.isPending}
                onClick={async () => {
                  const target = pending
                  await change.mutateAsync({ userId: target.id, role: target.role })
                  setPending(null)
                }}
              >
                Change role
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
