import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/useAuth'
import { useAccounts } from '../../features/members/hooks'
import { useAwardPoints, usePointsLog } from '../../features/points/hooks'
import { pointsSchema } from '../../features/points/schema'
import { cn, formatNepalDateTime } from '../../lib/utils'

export default function Points() {
  const { profile } = useAuth()
  const [direction, setDirection] = useState('award')

  const accounts = useAccounts()
  const log = usePointsLog()
  const award = useAwardPoints()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(pointsSchema), defaultValues: { points: 10, reason: '' } })

  // Only people who can actually hold points: active members.
  const members = useMemo(
    () => (accounts.data ?? []).filter((account) => account.role === 'member' && account.is_active),
    [accounts.data],
  )

  async function onSubmit(values) {
    const points = direction === 'award' ? values.points : -values.points
    await award.mutateAsync({ ...values, points, givenById: profile.id })
    reset({ points: 10, reason: '' })
  }

  const rows = log.data ?? []

  const columns = [
    {
      key: 'member',
      label: 'Member',
      sortable: true,
      sortValue: (row) => row.member?.full_name ?? '',
      className: 'font-medium',
      render: (row) => row.member?.full_name ?? '—',
    },
    {
      key: 'points',
      label: 'Points',
      sortable: true,
      sortValue: (row) => row.points,
      render: (row) => (
        <span className={cn('font-mono text-sm', row.points > 0 ? 'text-success' : 'text-danger')}>
          {row.points > 0 ? `+${row.points}` : row.points}
        </span>
      ),
    },
    { key: 'reason', label: 'Reason', className: 'max-w-[28rem]' },
    {
      key: 'given_by',
      label: 'Recorded by',
      render: (row) => row.giver?.full_name ?? '—',
    },
    {
      key: 'created_at',
      label: 'When',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs whitespace-nowrap text-muted">
          {formatNepalDateTime(row.created_at)}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Points"
        description="Award or deduct points with a reason. The top contributors page reads this list."
      />

      <Card className="mb-8 max-w-2xl">
        {accounts.isPending ? (
          <div className="grid place-items-center py-10">
            <Spinner />
          </div>
        ) : accounts.isError ? (
          <ErrorState message="We could not load the member list." onRetry={accounts.refetch} />
        ) : members.length === 0 ? (
          <p className="text-sm text-muted">
            There are no active members yet. Create one on the Members page first.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text">Member</span>
              <select
                aria-label="Member"
                className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
                defaultValue=""
                {...register('member_id')}
              >
                <option value="" disabled>
                  Choose a member…
                </option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                    {member.class ? ` · ${member.class}` : ''}
                  </option>
                ))}
              </select>
              {errors.member_id && (
                <p className="text-xs text-danger">{errors.member_id.message}</p>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div
                role="group"
                aria-label="Points direction"
                className="flex rounded-md border border-border-strong"
              >
                <button
                  type="button"
                  aria-pressed={direction === 'award'}
                  onClick={() => setDirection('award')}
                  className={cn(
                    'inline-flex h-[46px] items-center gap-2 px-4 text-sm font-semibold transition-colors',
                    direction === 'award'
                      ? 'bg-primary text-primary-ink'
                      : 'text-muted hover:text-text',
                  )}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Award
                </button>
                <button
                  type="button"
                  aria-pressed={direction === 'deduct'}
                  onClick={() => setDirection('deduct')}
                  className={cn(
                    'inline-flex h-[46px] items-center gap-2 border-l border-border-strong px-4 text-sm font-semibold transition-colors',
                    direction === 'deduct' ? 'bg-danger text-white' : 'text-muted hover:text-text',
                  )}
                >
                  <Minus className="size-4" aria-hidden="true" />
                  Deduct
                </button>
              </div>

              <div className="w-32">
                <Input
                  label="Points"
                  type="number"
                  min="1"
                  max="1000"
                  error={errors.points?.message}
                  {...register('points')}
                />
              </div>
            </div>

            <Input
              label="Reason"
              hint="Shown to nobody outside the club team. Keep it factual."
              error={errors.reason?.message}
              {...register('reason')}
            />

            <div>
              <Button type="submit" loading={award.isPending}>
                {direction === 'award' ? 'Award points' : 'Deduct points'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      <h2 className="mb-4 text-lg font-semibold">History</h2>

      {log.isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {log.isError && (
        <ErrorState message="We could not load the points history." onRetry={log.refetch} />
      )}

      {!log.isPending && !log.isError && rows.length === 0 && (
        <EmptyState
          title="No points given yet"
          description="Every award and deduction is listed here, newest first."
        />
      )}

      {!log.isPending && !log.isError && rows.length > 0 && (
        <>
          <p className="mb-4 flex items-center gap-2 text-sm text-muted">
            <Badge variant="neutral">Read-only</Badge>A row is never edited: a correction is a new
            row.
          </p>
          <DataTable
            columns={columns}
            rows={rows}
            searchText={(row) => `${row.member?.full_name ?? ''} ${row.reason ?? ''}`}
            searchPlaceholder="Search by member or reason"
          />
        </>
      )}
    </>
  )
}
