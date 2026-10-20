import { useQuery } from '@tanstack/react-query'
import { fetchLeaderboard } from './api'

export function useLeaderboard(options) {
  return useQuery({
    queryKey: ['leaderboard', options ?? {}],
    queryFn: () => fetchLeaderboard(options),
  })
}
