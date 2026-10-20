import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import GalleryGrid from '../../features/gallery/components/GalleryGrid'
import Lightbox from '../../features/gallery/components/Lightbox'
import { useGalleryPhotos } from '../../features/gallery/hooks'

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="aspect-[4/3] animate-pulse rounded-sm bg-surface-alt" />
      ))}
    </div>
  )
}

export default function Gallery() {
  const { data, isPending, isError, refetch } = useGalleryPhotos()
  const [eventId, setEventId] = useState('all')
  const [openIndex, setOpenIndex] = useState(-1)

  const photos = data ?? []

  // The event filter is built from the photos that exist, so it never offers an
  // event with nothing to show.
  const events = [
    ...new Map(photos.filter((p) => p.events).map((p) => [p.events.id, p.events.title])),
  ]
  const shown = eventId === 'all' ? photos : photos.filter((p) => p.event_id === eventId)

  function chooseEvent(value) {
    setEventId(value)
    setOpenIndex(-1)
  }

  return (
    <Section>
      <PageHeader title="Photo gallery" description="Pictures from club events and activities." />

      {isPending && <Skeleton />}

      {isError && (
        <ErrorState message="We could not load the gallery right now." onRetry={refetch} />
      )}

      {!isPending && !isError && photos.length === 0 && (
        <EmptyState title="No photos yet" description="Photos from our events will appear here." />
      )}

      {events.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label htmlFor="gallery-event" className="text-sm text-muted">
            Event
          </label>
          <select
            id="gallery-event"
            value={eventId}
            onChange={(event) => chooseEvent(event.target.value)}
            className="h-11 rounded-sm border border-border bg-surface px-3 text-text"
          >
            <option value="all">All photos</option>
            {events.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </div>
      )}

      {photos.length > 0 && shown.length === 0 && (
        <EmptyState title="No photos for this event" description="Try another event." />
      )}

      {shown.length > 0 && <GalleryGrid photos={shown} onOpen={setOpenIndex} />}

      <Lightbox
        photos={shown}
        index={openIndex}
        onClose={() => setOpenIndex(-1)}
        onChange={setOpenIndex}
      />
    </Section>
  )
}
