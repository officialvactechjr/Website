import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createEvent,
  deleteEvent,
  fetchEvent,
  fetchEvents,
  fetchEventsForAdmin,
  updateEvent,
} from './api'

export function useEvents(options) {
  return useQuery({ queryKey: ['events', options ?? {}], queryFn: () => fetchEvents(options) })
}

export function useEvent(id) {
  return useQuery({ queryKey: ['event', id], queryFn: () => fetchEvent(id), enabled: Boolean(id) })
}

export function useEventsForAdmin() {
  return useQuery({ queryKey: ['events', 'admin'], queryFn: () => fetchEventsForAdmin() })
}

// Every mutation toasts, so no caller can forget.
function useEventMutation(mutationFn, successMessage, failureMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(successMessage)
    },
    onError: () => toast.error(failureMessage),
  })
}

export function useCreateEvent() {
  return useEventMutation(
    createEvent,
    'Event created',
    'We could not create that event. Please try again.',
  )
}

export function useUpdateEvent() {
  return useEventMutation(
    updateEvent,
    'Event updated',
    'We could not save that event. Please try again.',
  )
}

export function useDeleteEvent() {
  return useEventMutation(
    deleteEvent,
    'Event deleted',
    'We could not delete that event. Please try again.',
  )
}
