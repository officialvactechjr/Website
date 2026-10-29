import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  fetchTemplates,
  updateTemplate,
} from './api'

/** `kind` narrows to 'membership' or 'event'; omit it for every template. */
export function useTemplates(kind) {
  return useQuery({
    queryKey: ['form_templates', kind ?? 'all'],
    queryFn: () => fetchTemplates({ kind }),
  })
}

function useTemplateMutation(mutationFn, successMessage, failureMessage) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form_templates'] })
      toast.success(successMessage)
    },
    onError: (error) => toast.error(error?.message ?? failureMessage),
  })
}

export function useCreateTemplate() {
  return useTemplateMutation(createTemplate, 'Template saved', 'We could not save that template.')
}

export function useUpdateTemplate() {
  return useTemplateMutation(
    updateTemplate,
    'Template updated',
    'We could not update that template.',
  )
}

export function useDuplicateTemplate() {
  return useTemplateMutation(
    duplicateTemplate,
    'Template duplicated',
    'We could not duplicate that template.',
  )
}

export function useDeleteTemplate() {
  return useTemplateMutation(
    deleteTemplate,
    'Template deleted',
    'We could not delete that template.',
  )
}
