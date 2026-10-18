import { useQuery } from '@tanstack/react-query'
import { fetchNotice, fetchNotices } from './api'

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
