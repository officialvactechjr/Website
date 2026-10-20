import { useQuery } from '@tanstack/react-query'
import { fetchMembers } from './api'

/** The public member list. Read-only: there is nothing to write here. */
export function useMembers(options) {
  return useQuery({ queryKey: ['members', options ?? {}], queryFn: () => fetchMembers(options) })
}
