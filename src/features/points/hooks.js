import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { awardPoints, fetchPointsLog } from './api'

export function usePointsLog() {
  return useQuery({ queryKey: ['points'], queryFn: () => fetchPointsLog() })
}

export function useAwardPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: awardPoints,
    onSuccess: () => {
      // The public leaderboard and the dashboard counts both move with this.
      queryClient.invalidateQueries({ queryKey: ['points'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Points recorded')
    },
    onError: () => toast.error('We could not record those points. Please try again.'),
  })
}
