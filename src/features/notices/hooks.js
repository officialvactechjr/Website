import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createNotice,
  deleteNotice,
  fetchNotice,
  fetchNotices,
  fetchNoticesForAdmin,
  updateNotice,
} from './api'

export function useNotices(options) {
  return useQuery({ queryKey: ['notices', options ?? {}], queryFn: () => fetchNotices(options) })
}

export function useNotice(id) {
  return useQuery({
    queryKey: ['notice', id],
    queryFn: () => fetchNotice(id),
    enabled: Boolean(id),
  })
}

export function useNoticesForAdmin() {
  return useQuery({ queryKey: ['notices', 'admin'], queryFn: () => fetchNoticesForAdmin() })
}

// Every mutation toasts, so no caller can forget. The public list and the admin
// list share the 'notices' key prefix, so one invalidation refreshes both.
function useNoticeMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(successMessage)
    },
    onError: () => toast.error('We could not save that. Please try again.'),
  })
}

export function useCreateNotice() {
  return useNoticeMutation(createNotice, 'Notice published')
}

export function useUpdateNotice() {
  return useNoticeMutation(updateNotice, 'Notice updated')
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Notice deleted')
    },
    onError: () => toast.error('We could not delete that notice. Please try again.'),
  })
}
