import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { passwordProblem } from '../schema'

/** Generate a new temporary password, or type one, for an existing account. */
export default function ResetPasswordDialog({ account, onSubmit, onCancel, submitting }) {
  const [mode, setMode] = useState('generate')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  function submit(event) {
    event.preventDefault()
    if (mode === 'typed') {
      const problem = passwordProblem(password, account.email ?? '', account.full_name ?? '')
      if (problem) {
        setError(problem)
        return
      }
    }
    setError(null)
    onSubmit({ userId: account.id, password: mode === 'typed' ? password : '' })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A new temporary password for{' '}
        <span className="font-medium text-text">{account.full_name}</span>. They choose their own on
        first login.
      </p>

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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error}
        />
      )}

      {error && mode !== 'typed' && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Reset password
        </Button>
      </div>
    </form>
  )
}
