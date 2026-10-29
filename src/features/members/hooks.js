import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../context/useAuth'
import {
  applyChangeRequest,
  bulkCreateMembers,
  createChangeRequest,
  createMember,
  fetchAccounts,
  fetchChangeRequests,
  fetchMembers,
  fetchMyChangeRequests,
  fetchOwnDetails,
  rejectChangeRequest,
  resetMemberPassword,
  setMemberStatus,
  updateOwnProfile,
} from './api'

/** The public member list. Read-only: there is nothing to write here. */
export function useMembers(options) {
  return useQuery({ queryKey: ['members', options ?? {}], queryFn: () => fetchMembers(options) })
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: () => fetchAccounts() })
}

/**
 * Edge Function errors already arrive as plain sentences, so they are shown
 * as-is; anything else falls back to a generic line.
 */
function useAccountMutation(mutationFn, successMessage, fallbackMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(successMessage)
    },
    onError: (error) => toast.error(error?.message ?? fallbackMessage),
  })
}

export function useCreateMember() {
  return useAccountMutation(createMember, 'Account created', 'We could not create that account.')
}

export function useBulkCreateMembers() {
  return useAccountMutation(
    bulkCreateMembers,
    'Import finished',
    'We could not finish that import.',
  )
}

export function useResetMemberPassword() {
  return useAccountMutation(
    resetMemberPassword,
    'New temporary password created',
    'We could not reset that password.',
  )
}

export function useSetMemberStatus() {
  return useAccountMutation(setMemberStatus, 'Account updated', 'We could not change that account.')
}

// ---------------------------------------------------------------------------
// Profile change requests
// ---------------------------------------------------------------------------
export function useChangeRequests() {
  return useQuery({ queryKey: ['change_requests'], queryFn: () => fetchChangeRequests() })
}

export function useMyChangeRequests(memberId) {
  return useQuery({
    queryKey: ['change_requests', 'mine', memberId],
    queryFn: () => fetchMyChangeRequests(memberId),
    enabled: Boolean(memberId),
  })
}

export function useCreateChangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change_requests'] })
      toast.success('Request sent for approval')
    },
    onError: (error) => {
      if (error?.code === '23505') {
        toast.error('You already have an open request for that field.')
        return
      }
      toast.error('We could not send that request. Please try again.')
    },
  })
}

export function useApplyChangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change_requests'] })
      toast.success('Change applied')
    },
    onError: (error) => toast.error(error?.message ?? 'We could not apply that change.'),
  })
}

export function useRejectChangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change_requests'] })
      toast.success('Request rejected')
    },
    onError: () => toast.error('We could not reject that request. Please try again.'),
  })
}

// ---------------------------------------------------------------------------
// The member's own profile
// ---------------------------------------------------------------------------
export function useOwnDetails(memberId) {
  return useQuery({
    queryKey: ['own_details', memberId],
    queryFn: () => fetchOwnDetails(memberId),
    enabled: Boolean(memberId),
  })
}

/** Saves immediately, then refreshes the header photo through AuthContext. */
export function useUpdateOwnProfile() {
  const queryClient = useQueryClient()
  const { refreshProfile } = useAuth()

  return useMutation({
    mutationFn: updateOwnProfile,
    onSuccess: async () => {
      await refreshProfile()
      queryClient.invalidateQueries({ queryKey: ['own_details'] })
      toast.success('Saved')
    },
    onError: () => toast.error('We could not save that. Please try again.'),
  })
}
