import { RefreshCw } from 'lucide-react'
import Button from '../ui/Button'

/**
 * Re-reads a list on demand. The lists no longer refetch when the tab regains
 * focus (see lib/queryClient.js), so this is the deliberate way to ask for fresh
 * rows — and while a refetch is running it says so quietly.
 */
export default function RefreshButton({ onRefresh, refreshing = false }) {
  return (
    <Button variant="secondary" size="sm" onClick={onRefresh} disabled={refreshing}>
      <RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} aria-hidden="true" />
      {refreshing ? 'Updating' : 'Refresh'}
    </Button>
  )
}
