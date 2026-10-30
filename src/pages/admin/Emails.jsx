import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import Textarea from '../../components/ui/Textarea'
import { useAccounts } from '../../features/members/hooks'
import { useEmailLog, useSendBroadcast } from '../../features/emails/hooks'
import { emailSchema, GROUPS, RECIPIENT_CAP } from '../../features/emails/schema'
import { formatNepalDateTime } from '../../lib/utils'

const MAX_BODY = 20000
const groupLabel = (value) => GROUPS.find((group) => group.value === value)?.label ?? value

export default function Emails() {
  const accounts = useAccounts()
  const log = useEmailLog()
  const send = useSendBroadcast()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [preview, setPreview] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { group: 'all_active_members', subject: '', body: '' },
  })

  // useWatch rather than watch(): the compiler can memoize this component.
  const group = useWatch({ control, name: 'group' })
  const body = useWatch({ control, name: 'body' }) ?? ''

  const members = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (accounts.data ?? [])
      .filter((account) => account.role === 'member' && account.is_active)
      .filter((account) => !needle || account.full_name.toLowerCase().includes(needle))
  }, [accounts.data, search])

  const activeMembers = (accounts.data ?? []).filter(
    (account) => account.role === 'member' && account.is_active,
  ).length

  const recipientCount =
    group === 'selected_members'
      ? selected.length
      : group === 'all_active_members'
        ? activeMembers
        : null

  const overCap = recipientCount !== null && recipientCount > RECIPIENT_CAP

  function toggleMember(id) {
    setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]))
  }

  function onSubmit(values) {
    if (group === 'selected_members' && selected.length === 0) {
      setPreview({ error: 'Choose at least one member.' })
      return
    }
    if (overCap) {
      setPreview({
        error: `That is ${recipientCount} people. One dispatch reaches at most ${RECIPIENT_CAP} — narrow the group.`,
      })
      return
    }

    // The preview shows exactly what leaves: plain text, escaped, nothing else.
    setPreview({ ...values, recipientCount })
  }

  async function confirmSend() {
    const values = preview
    if (!values || values.error) return

    await send.mutateAsync({
      group: values.group,
      userIds: selected,
      subject: values.subject,
      body: values.body,
    })
    setPreview(null)
  }

  const rows = log.data ?? []

  const columns = [
    {
      key: 'created_at',
      label: 'Sent',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs whitespace-nowrap text-muted">
          {formatNepalDateTime(row.created_at)}
        </span>
      ),
    },
    { key: 'subject', label: 'Subject', className: 'font-medium max-w-[24rem]' },
    { key: 'recipient_group', label: 'Group', render: (row) => groupLabel(row.recipient_group) },
    {
      key: 'recipient_count',
      label: 'People',
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.recipient_count}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) =>
        row.status === 'sent' ? (
          <Badge variant="success">Sent</Badge>
        ) : (
          <Badge variant="danger">Failed</Badge>
        ),
    },
    {
      key: 'sender',
      label: 'By',
      render: (row) => row.sender?.full_name ?? '—',
    },
  ]

  return (
    <>
      <PageHeader
        title="Emails"
        description="Send a club update. Every dispatch is written to the history below."
      />

      <Card className="mb-8 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-text">Who receives it</legend>
            {GROUPS.map((option) => (
              <label key={option.value} className="flex items-center gap-3 text-sm">
                <input
                  type="radio"
                  value={option.value}
                  className="size-4 accent-primary"
                  {...register('group')}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          {group === 'selected_members' && (
            <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
              {accounts.isPending ? (
                <div className="grid place-items-center py-6">
                  <Spinner />
                </div>
              ) : accounts.isError ? (
                <ErrorState
                  message="We could not load the member list."
                  onRetry={accounts.refetch}
                />
              ) : (
                <>
                  <Input
                    name="member-search"
                    label="Find a member"
                    placeholder="Search by name"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <div className="scroll-thin max-h-64 overflow-y-auto rounded-sm border border-border">
                    {members.length === 0 ? (
                      <p className="p-3 text-sm text-muted">No member matches that name.</p>
                    ) : (
                      members.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-0"
                        >
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={selected.includes(member.id)}
                            onChange={() => toggleMember(member.id)}
                          />
                          <span className="font-medium">{member.full_name}</span>
                          {member.class && (
                            <span className="text-xs text-muted">{member.class}</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted">{selected.length} chosen</p>
                </>
              )}
            </div>
          )}

          <Input label="Subject" error={errors.subject?.message} {...register('subject')} />
          <Textarea
            label="Message"
            rows={9}
            maxLength={MAX_BODY}
            hint={`${body.length} of ${MAX_BODY} characters. Plain text only — nothing is turned into a web page.`}
            error={errors.body?.message}
            {...register('body')}
          />

          {recipientCount !== null && (
            <p className={overCap ? 'text-sm text-danger' : 'text-sm text-muted'}>
              This reaches {recipientCount} {recipientCount === 1 ? 'person' : 'people'}.
              {overCap && ` One dispatch reaches at most ${RECIPIENT_CAP}.`}
            </p>
          )}

          <div>
            <Button type="submit" loading={send.isPending} disabled={overCap}>
              Preview and send
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Dispatch history</h2>

      {log.isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {log.isError && (
        <ErrorState message="We could not load the email history." onRetry={log.refetch} />
      )}

      {!log.isPending && !log.isError && rows.length === 0 && (
        <EmptyState
          title="Nothing sent yet"
          description="Each dispatch is listed here with its group, size and result."
        />
      )}

      {!log.isPending && !log.isError && rows.length > 0 && (
        <DataTable
          columns={columns}
          rows={rows}
          searchText={(row) => `${row.subject} ${row.recipient_group}`}
          searchPlaceholder="Search sent emails"
        />
      )}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.error ? 'Not sent' : 'Send this email?'}
        size="lg"
      >
        {preview?.error ? (
          <>
            <p className="text-sm text-danger">{preview.error}</p>
            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setPreview(null)}>
                Close
              </Button>
            </div>
          </>
        ) : preview ? (
          <>
            <p className="text-sm text-muted">
              To {groupLabel(preview.group)} —{' '}
              {preview.recipientCount ?? 'all applicants who left an email'}. This is the message as
              it will arrive, plain text and nothing else.
            </p>
            <div className="mt-4 rounded-sm border border-border p-4">
              <p className="font-medium">{preview.subject}</p>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-muted">{preview.body}</pre>
            </div>
            <p className="mt-3 text-xs text-muted">
              A large group takes up to a minute. You can send five dispatches every ten minutes.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setPreview(null)}
                disabled={send.isPending}
              >
                Cancel
              </Button>
              <Button onClick={confirmSend} loading={send.isPending}>
                Send now
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  )
}
