import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import Textarea from '../../components/ui/Textarea'
import WindowCountdown from '../../features/registrations/components/WindowCountdown'
import { useCreateApplication, useNow, useWindows } from '../../features/registrations/hooks'
import { membershipApplicationSchema } from '../../features/registrations/schema'
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(membershipApplicationSchema) })

  // `now` ticks, so this flips to closed on its own when the deadline passes.
  const state = windowState(data ?? [], new Date(now))

  function submit(values) {
    if (values.website) {
      setSent(true)
      return
    }

    const application = { ...values }
    delete application.website // honeypot, never stored
    createApplication.mutate(
      { ...application, window_id: state.open.id },
      { onSuccess: () => setSent(true) },
    )
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

          <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 flex flex-col gap-4">
            <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Class"
                hint="For example 11 or 12"
                error={errors.class?.message}
                {...register('class')}
              />
              <Input label="Section" error={errors.section?.message} {...register('section')} />
            </div>

            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone"
              type="tel"
              hint="Optional"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Textarea
              label="Why do you want to join?"
              rows={4}
              hint="Optional, but it helps the team."
              error={errors.reason?.message}
              {...register('reason')}
            />

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[var(--primary)]"
                {...register('consent')}
              />
              <span>My name, class and GitHub link may be shown on the club's public pages.</span>
            </label>
            {errors.consent && <p className="text-xs text-danger">{errors.consent.message}</p>}

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              {...register('website')}
            />

            <Button type="submit" loading={createApplication.isPending} className="self-start">
              Send application
            </Button>
          </form>
        </Card>
      )}

      {!profile && !isPending && !isError && !sent && !state.open && <Closed state={state} />}
    </Section>
  )
}
