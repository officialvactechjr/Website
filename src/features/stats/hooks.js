import { useQuery } from '@tanstack/react-query'
import { fetchSiteStats } from './api'

/**
 * Home's totals, in one request.
 *
 * `staleTime` of a minute and `refetchOnMount: 'always'` are the fix for numbers
 * that looked frozen: every visit and every reload re-reads the row, instead of
 * showing whatever the five-minute site-wide default had cached. The global
 * `placeholderData` still holds the last numbers on screen during that re-read,
 * so the row never flashes empty on the way back.
 *
 * `lib/queryClient.js` invalidates this key after *every* successful mutation,
 * so staff see a change the moment they make it.
 */
export function useSiteStats() {
  return useQuery({
    queryKey: ['site_stats'],
    queryFn: fetchSiteStats,
    staleTime: 60_000,
    refetchOnMount: 'always',
  })
}
