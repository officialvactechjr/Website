import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Input({ label, error, hint, id, className, type, ...props }) {
  const inputId = id || props.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  const [revealed, setRevealed] = useState(false)

  // A password field gets a reveal toggle — typo-ed passwords are the usual
  // reason a first login fails.
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className={cn('relative', isPassword && 'flex')}>
        <input
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 rounded-sm border bg-surface px-3 text-text placeholder:text-muted',
            // No `outline-none` here: the global :focus-visible ring must stay visible
            // for keyboard users. The gold border is an extra hint, not the indicator.
            'focus:border-primary',
            error ? 'border-danger' : 'border-border',
            isPassword && 'flex-1',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="ml-2 grid size-11 shrink-0 place-items-center rounded-sm border border-border text-muted transition-colors hover:text-text"
          >
            {revealed ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
