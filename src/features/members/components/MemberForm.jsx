import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { passwordProblem } from '../schema'

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter the member’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  class: z.string().trim().min(1, 'Class is required').max(40),
  section: z.string().trim().min(1, 'Section is required').max(40),
  phone: z.string().trim().max(30).optional(),
  github_url: z
    .union([z.literal(''), z.url('Enter a full link starting with https://')])
    .optional(),
  password: z.string().max(128).optional(),
})

/** `values` prefills the form (for example from an approved application). */
export default function MemberForm({ values, onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: values ?? {} })

  const [mode, setMode] = useState('generate')

  function submit(form) {
    if (mode === 'typed') {
      const problem = passwordProblem(form.password, form.email, form.full_name)
      if (problem) {
        setError('password', { message: problem })
        return
      }
    }
    onSubmit({ ...form, password: mode === 'typed' ? (form.password ?? '') : '' })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          hint="Optional."
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="GitHub link"
          hint="Optional."
          error={errors.github_url?.message}
          {...register('github_url')}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-text">Password</legend>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            checked={mode === 'generate'}
            onChange={() => setMode('generate')}
            className="size-4 accent-[var(--primary)]"
          />
          Generate a strong password (recommended)
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            checked={mode === 'typed'}
            onChange={() => setMode('typed')}
            className="size-4 accent-[var(--primary)]"
          />
          Type a password
        </label>
        {mode === 'typed' && (
          <Input
            label="Temporary password"
            hint="At least 10 characters, and not the person’s name or email."
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}
      </fieldset>

      <p className="text-xs text-muted">
        The club team hands the email and the temporary password to the member in person. They
        choose their own password on first login. The password is shown once and never stored.
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
