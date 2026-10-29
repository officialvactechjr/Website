import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import ResetPasswordDialog from '../../features/members/components/ResetPasswordDialog'
import StaffForm from '../../features/members/components/StaffForm'
import TempPassword from '../../features/members/components/TempPassword'
import { useChangeRole } from '../../features/accounts/hooks'
import {
  useAccounts,
  useCreateStaff,
  useResetMemberPassword,
  useSetMemberStatus,
} from '../../features/members/hooks'
import { useAuth } from '../../context/useAuth'
import { formatDate } from '../../lib/utils'

const ROLE_LABEL = { manager: 'Manager', admin: 'Admin', super_admin: 'Super Admin' }

// A member needs a class and a section, so moving a staff account to Member is
// only offered here as a role change — the class/section are set beforehand.
const ASSIGNABLE = [
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member (moves them off this page)' },
]

export default function StaffAdmin() {
  const { profile } = useAuth()
  const isSuper = profile?.role === 'super_admin'

  const { data, isPending, isError, refetch } = useAccounts('staff')
  const createStaff = useCreateStaff()
  const resetPassword = useResetMemberPassword()
  const setStatus = useSetMemberStatus()
  const changeRole = useChangeRole()

  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState(null)
  const [pending, setPending] = useState(null)
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
        <PageHeader title="Staff" />
        <ErrorState message="We could not load the staff accounts." onRetry={refetch} />
      </>
    )
  }

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
        <Badge variant={row.role === 'manager' ? 'neutral' : 'gold'}>{ROLE_LABEL[row.role]}</Badge>
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
      render: (row) => {
        if (!isSuper) return <span className="text-xs text-muted">Super Admin only</span>
        if (row.role === 'super_admin') {
          return <span className="text-xs text-muted">Handled in person</span>
        }
        if (row.id === profile?.id) {
          return <span className="text-xs text-muted">Your own account</span>
        }

        return (
          <div className="flex flex-wrap justify-end gap-2">
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
            <Button variant="ghost" size="sm" onClick={() => setResetting(row)}>
              Reset password
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(row)}>
              {row.is_active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Staff"
        description="Managers, admins and the super admin. Staff have no class or section."
      />

      {!isSuper && (
        <p className="mb-4 rounded-sm border border-border bg-surface p-4 text-sm text-muted">
          Only a Super Admin can create staff, reset their passwords, change roles or deactivate
          them. You can view the list.
        </p>
      )}

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(row) => `${row.full_name} ${row.email ?? ''} ${row.role}`}
        searchPlaceholder="Search staff"
        emptyTitle="No staff accounts yet"
        emptyDescription="Create a manager or an admin account and hand over the password in person."
        toolbar={
          isSuper ? (
            <Button onClick={() => setCreating(true)}>Create staff account</Button>
          ) : undefined
        }
      />

      <Modal open={creating} onClose={() => setCreating(false)} title="Create a staff account">
        <StaffForm
          onSubmit={(values) =>
            createStaff.mutate(values, {
              onSuccess: (result) => {
                setCreating(false)
                setHandover({ ...result, full_name: values.full_name })
              },
            })
          }
          onCancel={() => setCreating(false)}
          submitting={createStaff.isPending}
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

      <Modal open={Boolean(pending)} onClose={() => setPending(null)} title="Change this role?">
        {pending && (
          <>
            <p className="text-sm text-muted">
              <span className="font-medium text-text">{pending.full_name}</span> becomes{' '}
              <span className="font-medium text-text">{ROLE_LABEL[pending.role]}</span>. A member
              account needs a class and a section, so if they have none this is refused.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setPending(null)}
                disabled={changeRole.isPending}
              >
                Cancel
              </Button>
              <Button
                loading={changeRole.isPending}
                onClick={() => {
                  const target = pending
                  changeRole.mutate(
                    { userId: target.id, role: target.role },
                    { onSuccess: () => setPending(null) },
                  )
                }}
              >
                Change role
              </Button>
            </div>
          </>
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
        title={
          confirming?.is_active
            ? 'Deactivate this staff account?'
            : 'Reactivate this staff account?'
        }
        itemName={confirming?.full_name}
        confirmLabel={confirming?.is_active ? 'Deactivate' : 'Reactivate'}
        loading={setStatus.isPending}
      />
    </>
  )
}
