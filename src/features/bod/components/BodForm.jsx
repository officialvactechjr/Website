import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bodMemberSchema } from '../schema'
import Button from '../../../components/ui/Button'
import ImageUpload from '../../../components/shared/ImageUpload'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'

const BUCKET = 'bod-photos'

export default function BodForm({ member, onSubmit, onCancel, submitting = false }) {
  const [photo, setPhoto] = useState(member?.photo_url ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bodMemberSchema),
    defaultValues: {
      full_name: member?.full_name ?? '',
      position: member?.position ?? '',
      bio: member?.bio ?? '',
      term_year: member?.term_year ?? '',
      sort_order: member?.sort_order ?? 0,
      photo_url: member?.photo_url ?? '',
    },
  })

  function submit(values) {
    onSubmit({ ...values, photo_url: photo || null })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
      <Input label="Name" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Position" error={errors.position?.message} {...register('position')} />
      <Textarea label="Short bio" rows={3} error={errors.bio?.message} {...register('bio')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Term year"
          placeholder="2026"
          error={errors.term_year?.message}
          {...register('term_year')}
        />
        <Input
          label="Display order"
          type="number"
          hint="Lower numbers come first."
          error={errors.sort_order?.message}
          {...register('sort_order')}
        />
      </div>

      <ImageUpload bucket={BUCKET} value={photo} onChange={setPhoto} label="Photo" />

      <div className="mt-1 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {member ? 'Save changes' : 'Add member'}
        </Button>
      </div>
    </form>
  )
}
