import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchEmailLog, sendBroadcast } from './api'

export function useEmailLog() {
  return useQuery({ queryKey: ['email_log'], queryFn: () => fetchEmailLog() })
}

export function useSendBroadcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendBroadcast,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['email_log'] })

      if (result?.failed) {
        toast.warning(
          `Sent to ${result.sent} of ${result.total}. The rest were refused by the provider.`,
        )
      } else {
        toast.success(`Sent to ${result?.sent ?? 0} ${result?.sent === 1 ? 'person' : 'people'}`)
      }
    },
    onError: (error) => toast.error(error?.message ?? 'We could not send that email.'),
  })
}
