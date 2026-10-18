import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginSchema } from './schema'
import { fetchOwnProfile, signIn, signOut } from './api'
import { useAuth } from '../../context/useAuth'
import { homeForRole } from '../../lib/constants'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

/**
 * Where to send someone after login. Only same-site paths are accepted, so a
 * crafted `from` can never bounce them to another site. Parsing it against our
 * own origin also catches tricks like `/\evil.com`, which a plain "starts with
 * //" check misses because browsers treat the backslash as a slash.
 */
function safeFrom(from) {
  if (typeof from !== 'string' || !from.startsWith('/')) return null
  try {
    const url = new URL(from, window.location.origin)
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : null
  } catch {
    return null
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, profile, loading } = useAuth()
  const [formError, setFormError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const from = safeFrom(location.state?.from)

  // Already signed in and past the password change? Go where they were headed.
  if (!loading && session && profile && !profile.must_change_password) {
    return <Navigate to={from ?? homeForRole(profile.role)} replace />
  }

  async function onSubmit(values) {
    setFormError(null)

    try {
      await signIn(values.email, values.password)
    } catch {
      setFormError('Email or password is incorrect.')
      return
    }

    try {
      const own = await fetchOwnProfile()
      if (!own || own.is_active === false) {
        await signOut()
        setFormError('This account is deactivated. Contact the club team.')
        return
      }
      navigate(own.must_change_password ? '/change-password' : (from ?? homeForRole(own.role)), {
        replace: true,
      })
    } catch (error) {
      if (import.meta.env.DEV) console.error(error)
      setFormError('We could not load your account. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-[clamp(16px,4vw,40px)] py-16 sm:py-24">
      <h1 className="text-2xl font-semibold sm:text-3xl">Member login</h1>
      <p className="mt-2 text-sm text-muted">
        Use the email and password the club team gave you. There is no sign-up.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {formError && (
            <p
              role="alert"
              className="rounded-sm border border-danger px-3 py-2 text-sm text-danger"
            >
              {formError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting}>
            Log in
          </Button>
        </form>
      </Card>
    </div>
  )
}
