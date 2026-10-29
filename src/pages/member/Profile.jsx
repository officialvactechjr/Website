import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import ImageUpload from '../../components/shared/ImageUpload'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import PasswordForm from '../../features/auth/PasswordForm'
import {
  useCreateChangeRequest,
  useMyChangeRequests,
  useOwnDetails,
  useUpdateOwnProfile,
} from '../../features/members/hooks'
import { CHANGE_FIELDS, changeRequestSchema } from '../../features/members/schema'
import { useAuth } from '../../context/useAuth'
import { formatNepalDateTime } from '../../lib/utils'

const REQUEST_STATUS = {
  pending: { label: 'Waiting', variant: 'warning' },
  approved: { label: 'Applied', variant: 'success' },
  rejected: { label: 'Declined', variant: 'danger' },
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm">{value || <span className="text-muted">Not set</span>}</dd>
    </div>
  )
}

export default function Profile() {
  const { profile } = useAuth()
  const details = useOwnDetails(profile?.id)
  const requests = useMyChangeRequests(profile?.id)
  const save = useUpdateOwnProfile()
  const ask = useCreateChangeRequest()
  const [requestOpen, setRequestOpen] = useState(false)

  const githubForm = useForm({ values: { github_url: profile?.github_url ?? '' } })

  const requestForm = useForm({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: { field: 'email', new_value: '' },
  })

  const currentValues = {
    email: details.data?.email,
    phone: details.data?.phone,
    full_name: profile?.full_name,
    class: profile?.class,
    section: profile?.section,
  }

  const choseField = useWatch({ control: requestForm.control, name: 'field' })
  const chosen = CHANGE_FIELDS.find((item) => item.value === choseField) ?? CHANGE_FIELDS[0]

  function sendRequest(values) {
    ask.mutate(
      {
        memberId: profile.id,
        field: values.field,
        oldValue: currentValues[values.field] ?? null,
        newValue: values.new_value,
      },
      {
        onSuccess: () => {
          requestForm.reset({ field: values.field, new_value: '' })
          setRequestOpen(false)
        },
      },
    )
  }

  const rows = requests.data ?? []

  return (
    <Section>
      <PageHeader
        title="My profile"
        description="Your photo and GitHub link change straight away. Name, class, section, email and phone go to the club team first."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Account</h2>
            <Button variant="secondary" size="sm" onClick={() => setRequestOpen(true)}>
              <Pencil className="size-4" aria-hidden="true" />
              Request a change
            </Button>
          </div>

          {details.isPending ? (
            <div className="grid place-items-center py-8">
              <Spinner />
            </div>
          ) : details.isError ? (
            <ErrorState
              message="We could not load your contact details."
              onRetry={details.refetch}
            />
          ) : (
            <dl>
              <Row label="Name" value={profile?.full_name} />
              <Row label="Class" value={profile?.class} />
              <Row label="Section" value={profile?.section} />
              <Row label="Email" value={details.data?.email} />
              <Row label="Phone" value={details.data?.phone} />
            </dl>
          )}

          <p className="mt-4 text-xs text-muted">
            Email and phone are private. They are never shown on a public page, and no member can
            change them directly — the club team applies the approved ones.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">My change requests</h2>

          {requests.isPending && (
            <div className="grid place-items-center py-8">
              <Spinner />
            </div>
          )}

          {requests.isError && (
            <ErrorState message="We could not load your requests." onRetry={requests.refetch} />
          )}

          {!requests.isPending && !requests.isError && rows.length === 0 && (
            <p className="text-sm text-muted">
              Nothing requested yet. Use “Request a change” to ask for a new name, class, section,
              email or phone.
            </p>
          )}

          {rows.length > 0 && (
            <ul className="flex flex-col gap-3">
              {rows.map((request) => {
                const status = REQUEST_STATUS[request.status]
                const field = CHANGE_FIELDS.find((item) => item.value === request.field)
                return (
                  <li
                    key={request.id}
                    className="border-t border-border pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {field?.label ?? request.field}: {request.new_value}
                        </p>
                        <p className="font-mono text-xs text-muted">
                          asked {formatNepalDateTime(request.created_at)}
                        </p>
                        {request.status === 'rejected' && request.review_note && (
                          <p className="mt-1 text-sm text-danger">{request.review_note}</p>
                        )}
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Photo and GitHub</h2>

          <div className="flex flex-col gap-4">
            <ImageUpload
              bucket="avatars"
              folder={profile?.id}
              label="Your photo"
              value={profile?.avatar_url ?? ''}
              onChange={(url) =>
                save.mutate({ memberId: profile.id, patch: { avatar_url: url || null } })
              }
            />

            <form
              onSubmit={githubForm.handleSubmit((values) =>
                save.mutate({
                  memberId: profile.id,
                  patch: { github_url: values.github_url || null },
                }),
              )}
              noValidate
              className="flex flex-col gap-3"
            >
              <Input
                label="GitHub link"
                placeholder="https://github.com/…"
                hint="Shown next to your name on the public pages."
                error={githubForm.formState.errors.github_url?.message}
                {...githubForm.register('github_url')}
              />
              <div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  loading={save.isPending}
                  disabled={!githubForm.formState.isDirty}
                >
                  Save GitHub link
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Password</h2>
          <PasswordForm />
        </Card>
      </div>

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="Request a change">
        <form
          onSubmit={requestForm.handleSubmit(sendRequest)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="change-field" className="text-sm font-medium text-text">
              What should change?
            </label>
            <select
              id="change-field"
              className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
              {...requestForm.register('field')}
            >
              {CHANGE_FIELDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">{chosen.hint}</p>
          </div>

          <Input
            label="New value"
            hint={
              currentValues[chosen.value]
                ? `Now: ${currentValues[chosen.value]}`
                : 'Nothing is set at the moment.'
            }
            error={requestForm.formState.errors.new_value?.message}
            {...requestForm.register('new_value')}
          />

          <p className="rounded-sm border border-border px-3 py-2 text-sm text-muted">
            The club team checks it first. You can only have one open request per field at a time.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={ask.isPending}>
              Send request
            </Button>
          </div>
        </form>
      </Modal>
    </Section>
  )
}
