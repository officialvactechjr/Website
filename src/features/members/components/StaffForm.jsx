import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { passwordProblem } from '../schema'

const schema = z.object({
  role: z.enum(['manager', 'admin']),
  full_name: z.string().trim().min(2, 'Enter the person’s full name').max(120),
  email: z.email('Enter a valid email address').max(160),
  password: z.string().max(128).optional(),
})

export default function StaffForm({ onSubmit, onCancel, submitting }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'manager' } })

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="staff-role" className="text-sm font-medium text-text">
          Role
        </label>
        <select
          id="staff-role"
          className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
          {...register('role')}
        >
          <option value="manager">Manager — content, approvals, registrations, suggestions</option>
          <option value="admin">Admin — everything a manager has, plus accounts and points</option>
        </select>
      </div>

      <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

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
        Staff accounts have no class or section. The password is shown once and never stored; the
        person chooses their own on first login. A super admin cannot be created from here.
      </p>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Create staff account
        </Button>
      </div>
    </form>
  )
}
