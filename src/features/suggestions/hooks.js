import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchSuggestions, sendSuggestion, setSuggestionRead } from './api'

export function useSuggestions() {
  return useQuery({ queryKey: ['suggestions'], queryFn: () => fetchSuggestions() })
}

export function useSendSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
      toast.success('Thank you — the team will read it')
    },
    onError: (error) => {
      // The daily cap is a database rule; its message is already a plain sentence.
      const limited = /too many suggestions/i.test(error?.message ?? '')
      toast.error(limited ? error.message : 'We could not send that. Please try again in a moment.')
    },
  })
}

export function useSetSuggestionRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setSuggestionRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }),
    onError: () => toast.error('We could not update that suggestion.'),
  })
}
