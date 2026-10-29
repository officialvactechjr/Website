import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter the member’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  class: z.string().trim().max(40).optional(),
  section: z.string().trim().max(40).optional(),
  github_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
})

export default function MemberForm({ onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

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
        label="GitHub link"
        hint="Optional."
        error={errors.github_url?.message}
        {...register('github_url')}
      />

      <p className="text-xs text-muted">
        The club team hands the email and the temporary password to the member in person. They
        choose their own password on first login.
      </p>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </div>
    </form>
  )
}
