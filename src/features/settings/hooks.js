import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteSetting, fetchSettings, saveSetting } from './api'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings, staleTime: 10 * 60 * 1000 })
}

/**
 * One save for the whole screen: values are written, emptied ones are removed,
 * and the admin sees a single honest message instead of one toast per key.
 */
export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ values }) => {
      let changed = 0

      for (const [key, raw] of Object.entries(values)) {
        const value = typeof raw === 'string' ? raw.trim() : ''
        if (value) {
          await saveSetting({ key, value })
          changed += 1
        } else if (raw !== undefined) {
          await deleteSetting(key)
          changed += 1
        }
      }

      return changed
    },
    onSuccess: (changed) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success(changed === 0 ? 'Nothing to save' : 'Public details saved')
    },
    onError: () => toast.error('We could not save that. Please try again.'),
  })
}
