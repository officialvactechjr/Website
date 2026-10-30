import { MutationCache, QueryClient } from '@tanstack/react-query'

// `features/*/hooks.js` use this. Created once in lib/, never in a component.
//
// No refetch on window focus: the admin lists are read-only, and coming back to
// the tab must never blank a page or drop what somebody was typing. The Refresh
// button on each list is the deliberate way to re-read. A reconnect is different
// — a dropped connection usually means the data may have moved on, so that one
// is kept. `placeholderData` holds the last result during any refetch, so
// `isPending` (used for the first-load spinners) is never true again.
//
// Home's four numbers are the exception to "no refetch": they are one cheap
// aggregate row that must not look frozen. So every successful mutation in the
// app — members, projects, events, imports, status changes, anything added
// later — marks that one query stale here, in a single place, instead of every
// hook having to remember. `useSiteStats` then re-reads it on the next look.
const statsCache = new MutationCache({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site_stats'] }),
})

export const queryClient = new QueryClient({
  mutationCache: statsCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      placeholderData: (previous) => previous,
    },
  },
})
