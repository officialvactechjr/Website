import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import { cn } from '../../lib/utils'

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-sm border border-danger bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle className="size-6 text-danger" aria-hidden="true" />
      <p className="max-w-prose text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
