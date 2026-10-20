import { cn } from '../../lib/utils'

export default function Input({ label, error, hint, id, className, ...props }) {
  const inputId = id || props.name
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-11 rounded-sm border bg-surface px-3 text-text placeholder:text-muted',
          // No `outline-none` here: the global :focus-visible ring must stay visible
          // for keyboard users. The gold border is an extra hint, not the indicator.
          'focus:border-primary',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      />
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
