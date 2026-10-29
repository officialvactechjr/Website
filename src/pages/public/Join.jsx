import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import DynamicForm from '../../components/shared/DynamicForm'
import WindowCountdown from '../../features/registrations/components/WindowCountdown'
import { useCreateApplication, useNow, useWindows } from '../../features/registrations/hooks'
import { MEMBERSHIP_CORE, MEMBERSHIP_FIELDS } from '../../features/registrations/schema'
import { windowState } from '../../features/registrations/window'
import { useAuth } from '../../context/useAuth'
import { formatNepalDateTime } from '../../lib/utils'

function Closed({ state }) {
  return (
    <Card className="max-w-prose">
      <h2 className="font-semibold">Registration opens soon.</h2>
      {state.next ? (
        <p className="mt-2 text-sm text-muted">
          The next window runs from {formatNepalDateTime(state.next.opens_at)} to{' '}
          {formatNepalDateTime(state.next.closes_at)} (Nepal time). Fill in the form while it is
          open.
        </p>
      ) : state.last ? (
        <p className="mt-2 text-sm text-muted">
          Registration closed on {formatNepalDateTime(state.last.closes_at)} (Nepal time). The club
          team will announce the next window.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          The club team has not announced the next window yet. Watch the notices page.
        </p>
      )}
    </Card>
  )
}

export default function Join() {
  const { profile } = useAuth()
  const { data, isPending, isError, refetch } = useWindows()
  const now = useNow()
  const createApplication = useCreateApplication()
  const [sent, setSent] = useState(false)

  // `now` ticks, so this flips to closed on its own when the deadline passes.
  const state = windowState(data ?? [], new Date(now))

  // The window carries its own question snapshot. An older window with no
  // snapshot falls back to the club's default questions.
  const fields =
    state.open && Array.isArray(state.open.fields) && state.open.fields.length > 0
      ? state.open.fields
      : MEMBERSHIP_FIELDS

  function submit(values) {
    if (values.website) {
      setSent(true)
      return
    }

    // The five core answers keep their columns; everything else is stored in
    // `answers`, keyed by question id, so a changed form never breaks an old row.
    const application = { window_id: state.open.id, consent: values.consent === true, answers: {} }
    for (const [key, value] of Object.entries(values)) {
      if (key === 'website' || key === 'consent') continue
      if (MEMBERSHIP_CORE.includes(key)) application[key] = value === '' ? null : value
      else application.answers[key] = value
    }
    application.full_name = String(application.full_name ?? '').trim()
    application.email = String(application.email ?? '').trim()

    createApplication.mutate(application, { onSuccess: () => setSent(true) })
  }

  return (
    <Section>
      <PageHeader
        title="Join the club"
        description="Membership opens for a short window, then closes automatically."
      />

      {/* A signed-in member cannot apply again: one account per student. */}
      {profile && (
        <Card className="max-w-prose">
          <h2 className="font-semibold">You are already a member.</h2>
          <p className="mt-2 text-sm text-muted">
            Your account is signed in{profile.full_name ? ` as ${profile.full_name}` : ''}. New
            memberships are handled by the club team.
          </p>
          <p className="mt-4">
            <Link to="/profile" className="text-sm font-semibold text-primary-text hover:underline">
              Go to my profile
            </Link>
          </p>
        </Card>
      )}

      {!profile && isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {!profile && isError && (
        <ErrorState message="We could not load the membership dates." onRetry={refetch} />
      )}

      {!profile && !isPending && !isError && sent && (
        <Card className="max-w-prose">
          <h2 className="font-semibold">Thank you — your application was sent.</h2>
          <p className="mt-2 text-sm text-muted">
            The club team reviews every application. If it is approved you will get an email and a
            temporary password, and you choose your own password on your first login.
          </p>
        </Card>
      )}

      {!profile && !isPending && !isError && !sent && state.open && (
        <Card className="max-w-prose">
          <p className="text-sm text-muted">
            This window closes on {formatNepalDateTime(state.open.closes_at)} (Nepal time).
          </p>
          <WindowCountdown closesAt={state.open.closes_at} now={now} />

          <div className="mt-6">
            <DynamicForm
              fields={fields}
              onSubmit={submit}
              submitting={createApplication.isPending}
              submitLabel="Send application"
            />
          </div>
        </Card>
      )}

      {!profile && !isPending && !isError && !sent && !state.open && <Closed state={state} />}
    </Section>
  )
}
