import { cn } from '../../lib/utils'

export default function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-sm border border-border bg-surface p-5', className)} {...props}>
      {children}
    </div>
  )
}
