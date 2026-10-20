import { useQuery } from '@tanstack/react-query'
import { fetchProject, fetchProjects } from './api'

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
