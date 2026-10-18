import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from './schema'
import { changePassword, clearPasswordChangeFlag } from './api'
import { useAuth } from '../../context/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

/**
 * The one password form, used by the forced change page and by /profile.
 * `onDone` runs after a successful change.
 */
export default function PasswordForm({ onDone }) {
  const { profile, refreshProfile } = useAuth()
  const [formError, setFormError] = useState(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  async function onSubmit({ password }) {
    setFormError(null)

    try {
      await changePassword(password)
      if (profile?.must_change_password) await clearPasswordChangeFlag()
      await refreshProfile()
      reset()
      setSaved(true)
      if (onDone) onDone()
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
      setFormError('We could not save your new password. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      {formError && (
        <p role="alert" className="rounded-sm border border-danger px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      )}
      {saved && !formError && (
        <p
          role="status"
          className="rounded-sm border border-success px-3 py-2 text-sm text-success"
        >
          Your password has been changed.
        </p>
      )}

      <Button type="submit" loading={isSubmitting}>
        Save password
      </Button>
    </form>
  )
}
