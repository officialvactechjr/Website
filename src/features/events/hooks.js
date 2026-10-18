import { useQuery } from '@tanstack/react-query'
import { fetchEvent, fetchEvents } from './api'

export function useEvents(options) {
  return useQuery({ queryKey: ['events', options ?? {}], queryFn: () => fetchEvents(options) })
}

export function useEvent(id) {
  return useQuery({ queryKey: ['event', id], queryFn: () => fetchEvent(id), enabled: Boolean(id) })
}
