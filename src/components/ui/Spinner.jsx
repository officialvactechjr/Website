import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Spinner({ className }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn('size-5 animate-spin text-muted', className)}
    />
  )
}
