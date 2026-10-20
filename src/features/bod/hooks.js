import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createBodMember, deleteBodMember, fetchBodMembers, updateBodMember } from './api'

export function useBodMembers(options) {
  return useQuery({
    queryKey: ['bod_members', options ?? {}],
    queryFn: () => fetchBodMembers(options),
  })
}

function useBodMutation(mutationFn, successMessage, failureMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bod_members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(successMessage)
    },
    onError: () => toast.error(failureMessage),
  })
}

export function useCreateBodMember() {
  return useBodMutation(
    createBodMember,
    'Board member added',
    'We could not add that board member. Please try again.',
  )
}

export function useUpdateBodMember() {
  return useBodMutation(
    updateBodMember,
    'Board member updated',
    'We could not save that board member. Please try again.',
  )
}

export function useDeleteBodMember() {
  return useBodMutation(
    deleteBodMember,
    'Board member removed',
    'We could not remove that board member. Please try again.',
  )
}
