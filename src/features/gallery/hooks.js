import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createGalleryPhotos, deleteGalleryPhoto, fetchGalleryPhotos } from './api'

export function useGalleryPhotos(options) {
  return useQuery({
    queryKey: ['gallery', options ?? {}],
    queryFn: () => fetchGalleryPhotos(options),
  })
}

export function useCreateGalleryPhotos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGalleryPhotos,
    onSuccess: (_data, rows) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(rows.length === 1 ? 'Photo added' : `${rows.length} photos added`)
    },
    onError: () => toast.error('We could not save those photos. Please try again.'),
  })
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Photo deleted')
    },
    onError: () => toast.error('We could not delete that photo. Please try again.'),
  })
}
