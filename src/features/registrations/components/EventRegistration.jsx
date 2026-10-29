import { useState } from 'react'
import Card from '../../../components/ui/Card'
import DynamicForm from '../../../components/shared/DynamicForm'
import Spinner from '../../../components/ui/Spinner'
import { useCreateEventRegistration, useFormForEvent } from '../hooks'
import { formState } from '../window'
import { formatNepalDateTime } from '../../../lib/utils'

function Note({ title, children }) {
  return (
    <Card className="max-w-prose">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{children}</p>
    </Card>
  )
}

/** The registration block on an event page: open form, or why it is not open. */
export default function EventRegistration({ eventId, eventStatus }) {
  const { data: form, isPending, isError, refetch } = useFormForEvent(eventId)
  const createRegistration = useCreateEventRegistration()
  const [sent, setSent] = useState(false)

  const state = formState(form, eventStatus)

  if (isPending) {
    return (
      <div className="grid place-items-center py-8">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <Note title="Registration">
        We could not load the registration form.{' '}
        <button
          type="button"
          onClick={refetch}
          className="font-semibold text-primary-text underline"
        >
          Try again
        </button>
      </Note>
    )
  }

  if (sent) {
    return (
      <Note title="You are registered">
        Thank you. The club team has your details and will be in touch if anything changes.
      </Note>
    )
  }

  if (state === 'not-yet') {
    return (
      <Note title="Registration has not opened yet">
        Registration opens on {formatNepalDateTime(form.opens_at)} (Nepal time).
      </Note>
    )
  }

  if (state === 'closed') {
    return (
      <Note title="Registration is closed">
        Registration closed on {formatNepalDateTime(form.closes_at)} (Nepal time).
      </Note>
    )
  }

  if (state !== 'open') {
    return (
      <Note title="Registration">
        Registration for this event is not open yet. When the club team opens it, the form appears
        right here.
      </Note>
    )
  }

  const fields = Array.isArray(form.fields) ? form.fields : []

  function submit(values) {
    if (values.website) {
      setSent(true)
      return
    }

    const answers = { ...values }
    delete answers.website // honeypot, never stored
    createRegistration.mutate(
      {
        form_id: form.id,
        full_name: values.full_name?.trim() || null,
        email: values.email?.trim() || null,
        answers,
      },
      { onSuccess: () => setSent(true) },
    )
  }

  return (
    <Card className="max-w-prose">
      <h2 className="font-semibold">Register for this event</h2>
      <p className="mt-2 mb-5 text-sm text-muted">
        Registration closes on {formatNepalDateTime(form.closes_at)} (Nepal time).
      </p>
      <DynamicForm
        fields={fields}
        onSubmit={submit}
        submitting={createRegistration.isPending}
        submitLabel="Send registration"
      />
    </Card>
  )
}
