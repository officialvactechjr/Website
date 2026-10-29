import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { loginSchema } from './schema'
import { fetchOwnProfile, signIn, signOut } from './api'
import { useAuth } from '../../context/useAuth'
import { homeForRole } from '../../lib/constants'
import { cn } from '../../lib/utils'
import Button from '../../components/ui/Button'
import MascotScene from '../../components/shared/MascotScene'
import astronaut from '../../assets/hero/h.webp'

const TABS = [
  { id: 'login', label: 'Login' },
  { id: 'signup', label: 'Sign Up' },
]

// The reference's fields: tall, softly rounded, with a leading icon.
const FIELD =
  'h-[52px] w-full rounded-xl border border-border bg-surface/60 pr-4 pl-12 text-[15px] text-text placeholder:text-muted focus:border-accent-soft'

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
  const [tab, setTab] = useState('login')
  const [reveal, setReveal] = useState(false)
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
    <section className="relative isolate overflow-hidden border-b border-border bg-bg">
      <div className="relative mx-auto grid max-w-[1400px] lg:min-h-[calc(100svh-76px)] lg:grid-cols-2">
        {/* The mascot centred in its halo, with the club's floating objects
            scattered around it. */}
        <div className="hidden items-center justify-center p-[clamp(24px,4vw,48px)] lg:flex">
          <MascotScene className="aspect-square w-full max-w-[34rem]" spread="126%">
            <img
              src={astronaut}
              alt=""
              width={1600}
              height={1174}
              className="animate-float max-h-[74%] max-w-[74%] object-contain"
            />
          </MascotScene>
        </div>

        {/* The form column is opaque, so the objects behind it stay hidden — the
            scatter only reads where the mascot is, as in the design. */}
        <div className="flex flex-col justify-center bg-bg px-[clamp(20px,5vw,64px)] py-[clamp(32px,6vw,64px)] lg:border-l lg:border-border">
          <div className="mx-auto w-full max-w-[26rem]">
            <h1 className="sr-only">Member login</h1>

            <div
              role="tablist"
              aria-label="Login or sign up"
              className="grid grid-cols-2 border-b border-border"
            >
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    '-mb-px border-b-2 py-3 text-[15px] font-semibold transition-colors ease-assemble',
                    tab === item.id
                      ? 'border-accent-soft text-accent-soft'
                      : 'border-transparent text-muted hover:text-text',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <div role="tabpanel" id="panel-login" aria-labelledby="tab-login">
                <p className="mt-8 text-center text-[clamp(1.6rem,2.4vw,2rem)] font-bold tracking-tight text-accent-soft">
                  Welcome Back
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="mt-7 flex flex-col gap-4"
                >
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <label htmlFor="login-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? 'login-email-error' : undefined}
                      className={cn(FIELD, errors.email && 'border-danger')}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="login-email-error" className="text-xs text-danger">
                      {errors.email.message}
                    </p>
                  )}

                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <label htmlFor="login-password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type={reveal ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Password"
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={errors.password ? 'login-password-error' : undefined}
                      className={cn(FIELD, 'pr-12', errors.password && 'border-danger')}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setReveal((value) => !value)}
                      aria-label={reveal ? 'Hide password' : 'Show password'}
                      className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center text-muted transition-colors hover:text-text"
                    >
                      {reveal ? (
                        <EyeOff className="size-5" aria-hidden="true" />
                      ) : (
                        <Eye className="size-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="login-password-error" className="text-xs text-danger">
                      {errors.password.message}
                    </p>
                  )}

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-md border border-danger px-3 py-2 text-sm text-danger"
                    >
                      {formError}
                    </p>
                  )}

                  <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
                    Login
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="font-semibold text-accent-soft transition-colors hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            ) : (
              <div role="tabpanel" id="panel-signup" aria-labelledby="tab-signup">
                <p className="mt-8 text-center text-[clamp(1.6rem,2.4vw,2rem)] font-bold tracking-tight text-accent-soft">
                  Join the club
                </p>
                {/* There is no public sign-up: the club hands every account over in
                    person. The tab stays so the screen matches, and it says why. */}
                <p className="mt-6 text-[15px] leading-relaxed text-muted">
                  There is no public sign-up. The club team creates every account and hands the
                  email and a temporary password over in person. Apply for membership and the team
                  will contact you when a window opens.
                </p>
                <Button as={Link} to="/join" size="lg" className="mt-6 w-full">
                  Apply for membership
                </Button>
                <p className="mt-6 text-center text-sm text-muted">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="font-semibold text-accent-soft transition-colors hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
