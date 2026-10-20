import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { eventSchema } from '../schema'
import Button from '../../../components/ui/Button'
import ImageUpload from '../../../components/shared/ImageUpload'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import { fromDateTimeInput, toDateTimeInput } from '../../../lib/utils'

// Events have no bucket of their own in migration 0004, so covers live in the
// public `gallery` bucket. Ask for an `event-covers` bucket if you would rather
// keep them separate.
const BUCKET = 'gallery'

export default function EventForm({ event, onSubmit, onCancel, submitting = false }) {
  const [cover, setCover] = useState(event?.cover_image ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      location: event?.location ?? '',
      starts_at: toDateTimeInput(event?.starts_at),
      ends_at: toDateTimeInput(event?.ends_at),
      status: event?.status ?? 'draft',
      cover_image: event?.cover_image ?? '',
    },
  })

  function submit(values) {
    onSubmit({
      ...values,
      cover_image: cover || null,
      starts_at: fromDateTimeInput(values.starts_at),
      ends_at: fromDateTimeInput(values.ends_at),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea
        label="Description"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />
      <Input label="Location" error={errors.location?.message} {...register('location')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Starts"
          type="datetime-local"
          error={errors.starts_at?.message}
          {...register('starts_at')}
        />
        <Input
          label="Ends"
          type="datetime-local"
          hint="Optional."
          error={errors.ends_at?.message}
          {...register('ends_at')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-status" className="text-sm font-medium text-text">
          Status
        </label>
        <select
          id="event-status"
          className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          {...register('status')}
        >
          <option value="draft">Draft — hidden from the public</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <ImageUpload bucket={BUCKET} value={cover} onChange={setCover} label="Cover image" />

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {event ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  )
}
