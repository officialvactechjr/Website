import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noticeSchema } from '../schema'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import { fromDateTimeInput, toDateTimeInput } from '../../../lib/utils'

export default function NoticeForm({ notice, onSubmit, onCancel, submitting = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: notice?.title ?? '',
      body: notice?.body ?? '',
      is_pinned: notice?.is_pinned ?? false,
      published_at: toDateTimeInput(notice?.published_at ?? new Date()),
    },
  })

  function submit(values) {
    onSubmit({ ...values, published_at: fromDateTimeInput(values.published_at) })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea label="Notice" rows={6} error={errors.body?.message} {...register('body')} />
      <Input
        label="Publish at"
        type="datetime-local"
        hint="A notice stays hidden from visitors until this time."
        error={errors.published_at?.message}
        {...register('published_at')}
      />

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-[var(--primary)]"
          {...register('is_pinned')}
        />
        Pin this notice to the top of the list
      </label>

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {notice ? 'Save changes' : 'Publish notice'}
        </Button>
      </div>
    </form>
  )
}
