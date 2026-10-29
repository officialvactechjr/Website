import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createProject,
  decideProject,
  deleteProject,
  fetchMyProject,
  fetchMyProjects,
  fetchProject,
  fetchProjects,
  fetchReviewQueue,
  updateProject,
} from './api'

export function useProjects(options) {
  return useQuery({
    queryKey: ['projects', options ?? {}],
    queryFn: () => fetchProjects(options),
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  })
}

// ---------------------------------------------------------------------------
// Staff review
// ---------------------------------------------------------------------------
export function useReviewQueue(status = 'pending') {
  return useQuery({
    queryKey: ['review_queue', status],
    queryFn: () => fetchReviewQueue({ status }),
  })
}

export function useDecideProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: decideProject,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review_queue'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(variables.status === 'approved' ? 'Project approved' : 'Project rejected')
    },
    onError: (error) => {
      if (String(error?.message ?? '').includes('reason')) {
        toast.error('A rejection needs a reason for the member to read.')
        return
      }
      toast.error('We could not save that decision. Please try again.')
    },
  })
}

// ---------------------------------------------------------------------------
// The member's own projects
// ---------------------------------------------------------------------------
export function useMyProjects(ownerId) {
  return useQuery({
    queryKey: ['my_projects', ownerId],
    queryFn: () => fetchMyProjects(ownerId),
    enabled: Boolean(ownerId),
  })
}

export function useMyProject(id) {
  return useQuery({
    queryKey: ['my_project', id],
    queryFn: () => fetchMyProject(id),
    enabled: Boolean(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_projects'] })
      toast.success('Sent for approval')
    },
    onError: () => toast.error('We could not save your project. Please try again.'),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_projects'] })
      queryClient.invalidateQueries({ queryKey: ['my_project'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Saved — back in the approval queue')
    },
    onError: () => toast.error('We could not save your changes. Please try again.'),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => toast.error('We could not delete that project. Please try again.'),
  })
}
