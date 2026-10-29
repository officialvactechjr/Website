import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createApplication,
  createEventRegistration,
  createForm,
  createWindow,
  fetchApplications,
  fetchEventRegistrations,
  fetchFormForEvent,
  fetchFormsForAdmin,
  fetchWindows,
  markApplicationAccountCreated,
  updateApplicationStatus,
  updateForm,
  updateWindow,
} from './api'

const DUPLICATE = '23505'
const isClosedByRls = (error) => String(error?.message ?? '').includes('row-level security')

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------
export function useWindows() {
  return useQuery({ queryKey: ['membership_windows'], queryFn: () => fetchWindows() })
}

/**
 * A ticking clock, so a page can flip from "open" to "closed" on its own the
 * moment the closing time passes, without waiting for a refetch.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

export function useFormForEvent(eventId) {
  return useQuery({
    queryKey: ['registration_form', eventId],
    queryFn: () => fetchFormForEvent(eventId),
    enabled: Boolean(eventId),
  })
}

/** Public insert. Nothing to invalidate: no public screen reads these rows. */
export function useCreateApplication() {
  return useMutation({
    mutationFn: createApplication,
    onError: (error) => {
      if (error?.code === DUPLICATE) {
        toast.error('That email has already applied in this window.')
        return
      }
      if (isClosedByRls(error)) {
        toast.error('Registration is closed. Please check the dates.')
        return
      }
      toast.error('We could not send your application. Please try again.')
    },
  })
}

export function useCreateEventRegistration() {
  return useMutation({
    mutationFn: createEventRegistration,
    onError: (error) => {
      if (error?.code === DUPLICATE) {
        toast.error('That email is already registered for this event.')
        return
      }
      if (isClosedByRls(error)) {
        toast.error('Registration is closed. Please check the dates.')
        return
      }
      toast.error('We could not send your registration. Please try again.')
    },
  })
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------
export function useApplications() {
  return useQuery({ queryKey: ['applications'], queryFn: () => fetchApplications() })
}

export function useFormsForAdmin() {
  return useQuery({ queryKey: ['registration_forms', 'admin'], queryFn: fetchFormsForAdmin })
}

export function useEventRegistrations(formId) {
  return useQuery({
    queryKey: ['event_registrations', formId],
    queryFn: () => fetchEventRegistrations({ formId }),
    enabled: Boolean(formId),
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Application updated')
    },
    onError: () => toast.error('We could not update that application. Please try again.'),
  })
}

/** Marks an approved application whose account has just been created. */
export function useMarkApplicationAccountCreated() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markApplicationAccountCreated,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
    onError: () => toast.error('The account was created, but the application was not marked.'),
  })
}

function useFormMutation(mutationFn, successMessage, failureMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration_forms'] })
      queryClient.invalidateQueries({ queryKey: ['registration_form'] })
      toast.success(successMessage)
    },
    onError: (error) => {
      // The database refuses a question change once answers exist.
      if (String(error?.message ?? '').includes('cannot change')) {
        toast.error('This form already has registrations, so its questions are locked.')
        return
      }
      toast.error(failureMessage)
    },
  })
}

export function useCreateForm() {
  return useFormMutation(
    createForm,
    'Registration form created',
    'We could not create that form. Please try again.',
  )
}

export function useUpdateForm() {
  return useFormMutation(
    updateForm,
    'Registration form saved',
    'We could not save that form. Please try again.',
  )
}

function useWindowMutation(mutationFn, successMessage, failureMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership_windows'] })
      toast.success(successMessage)
    },
    onError: () => toast.error(failureMessage),
  })
}

export function useCreateWindow() {
  return useWindowMutation(
    createWindow,
    'Membership window created',
    'We could not create that window. Please try again.',
  )
}

export function useUpdateWindow() {
  return useWindowMutation(
    updateWindow,
    'Membership window saved',
    'We could not save that window. Please try again.',
  )
}
