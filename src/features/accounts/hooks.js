import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { changeRole } from './api'

export function useChangeRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changeRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Role updated')
    },
    // The function's refusals are written for a person, so show them as they are.
    onError: (error) => toast.error(error?.message ?? 'We could not change that role.'),
  })
}
