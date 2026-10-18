import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function EmptyState({ title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-sm border border-border bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <Inbox className="size-6 text-muted" aria-hidden="true" />
      <p className="font-medium text-text">{title}</p>
      {description && <p className="max-w-prose text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}
