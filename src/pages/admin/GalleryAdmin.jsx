import { useState } from 'react'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import PhotoUploader from '../../features/gallery/components/PhotoUploader'
import { useDeleteGalleryPhoto, useGalleryPhotos } from '../../features/gallery/hooks'
import { useEventsForAdmin } from '../../features/events/hooks'
import { formatDate } from '../../lib/utils'

export default function GalleryAdmin() {
  // Same query (and cache entry) as the public /gallery page. The higher limit
  // keeps every photo reachable in the admin table.
  const { data, isPending, isError, refetch } = useGalleryPhotos({ limit: 500 })
  const events = useEventsForAdmin()
  const deletePhoto = useDeleteGalleryPhoto()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  if (isPending) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Gallery" />
        <ErrorState message="We could not load the gallery right now." onRetry={refetch} />
      </>
    )
  }

  const columns = [
    {
      key: 'image_url',
      label: 'Photo',
      render: (photo) => (
        <img
          src={photo.image_url}
          alt=""
          width={80}
          height={48}
          loading="lazy"
          className="h-12 w-20 rounded-sm border border-border object-cover"
        />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      className: 'font-medium',
      render: (photo) => photo.title || '—',
    },
    {
      key: 'event_id',
      label: 'Event',
      render: (photo) => photo.events?.title ?? '—',
    },
    {
      key: 'taken_on',
      label: 'Taken',
      sortable: true,
      render: (photo) => (
        <span className="font-mono text-xs text-muted">
          {photo.taken_on ? formatDate(photo.taken_on) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (photo) => (
        <Button variant="ghost" size="sm" onClick={() => setDeleting(photo)}>
          Delete
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Gallery" description="Photos shown on the public gallery page." />

      <DataTable
        columns={columns}
        rows={data ?? []}
        searchText={(photo) =>
          `${photo.title ?? ''} ${photo.caption ?? ''} ${photo.events?.title ?? ''}`
        }
        searchPlaceholder="Search photos"
        emptyTitle="No photos yet"
        emptyDescription="Upload the first photos and they will show up here."
        toolbar={<Button onClick={() => setUploadOpen(true)}>Add photos</Button>}
      />

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Add photos">
        <PhotoUploader
          events={events.data ?? []}
          onDone={() => setUploadOpen(false)}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deletePhoto.mutate(
            { id: deleting.id, imageUrl: deleting.image_url },
            { onSuccess: () => setDeleting(null) },
          )
        }
        title="Delete this photo?"
        itemName={deleting?.title ?? 'this photo'}
        loading={deletePhoto.isPending}
      />
    </>
  )
}
