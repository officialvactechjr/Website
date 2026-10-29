import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Textarea from '../../components/ui/Textarea'
import { useAuth } from '../../context/useAuth'
import { useSendSuggestion } from '../../features/suggestions/hooks'
import { suggestionSchema } from '../../features/suggestions/schema'

const MAX = 2000

export default function Suggestions() {
  const { profile } = useAuth()
  const send = useSendSuggestion()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(suggestionSchema), defaultValues: { message: '' } })

  const length = (useWatch({ control, name: 'message' }) ?? '').length

  async function onSubmit({ message }) {
    setSent(false)
    await send.mutateAsync({ authorId: profile.id, message })
    reset()
    setSent(true)
  }

  return (
    <Section>
      <PageHeader
        title="Suggestion box"
        description="Ideas, complaints, anything the club team should hear."
      />

      <Card className="max-w-prose">
        <p className="mb-5 text-sm text-muted">
          Suggestions are <span className="font-medium text-text">anonymous to readers</span>. Staff
          see only the message, never your name — your account is recorded privately so the inbox
          cannot be flooded.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Textarea
            label="Your suggestion"
            rows={7}
            maxLength={MAX}
            hint={`${length} of ${MAX} characters. At least 10.`}
            error={errors.message?.message}
            {...register('message')}
          />

          {sent && (
            <p
              role="status"
              className="rounded-sm border border-success px-3 py-2 text-sm text-success"
            >
              Thank you — the team will read it.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={send.isPending}>
              Send suggestion
            </Button>
            <span className="text-xs text-muted">You can send up to 10 a day.</span>
          </div>
        </form>
      </Card>
    </Section>
  )
}
