import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/**
 * Native <dialog> for the free Esc handling and focus trapping (same trick as
 * Modal). `index` is -1 when closed.
 */
export default function Lightbox({ photos, index, onClose, onChange }) {
  const ref = useRef(null)
  const photo = index >= 0 ? photos[index] : null

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (photo && !dialog.open) dialog.showModal()
    if (!photo && dialog.open) dialog.close()
  }, [photo])

  useEffect(() => {
    if (!photo || photos.length < 2) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') onChange((index + 1) % photos.length)
      if (event.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [photo, index, photos.length, onChange])

  if (!photo) return null

  const step = (delta) => onChange((index + delta + photos.length) % photos.length)

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      aria-label={photo.title ?? 'Photo'}
      className="w-[min(64rem,calc(100vw-2rem))] rounded-sm border border-border bg-surface p-0 text-text backdrop:bg-black/80"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <p className="truncate font-semibold">{photo.title ?? 'Photo'}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="grid size-11 shrink-0 place-items-center text-muted transition-colors hover:text-text"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid place-items-center bg-surface-alt p-2">
        <img
          src={photo.image_url}
          alt={photo.title ?? ''}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />
      </div>

      <div className="flex items-center gap-4 px-5 py-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={photos.length < 2}
          aria-label="Previous photo"
          className="grid size-11 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-text disabled:opacity-40"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        {photo.caption ? (
          <p className="min-w-0 flex-1 text-center text-sm text-muted">{photo.caption}</p>
        ) : (
          <p className="min-w-0 flex-1 text-center text-xs text-muted">
            {index + 1} of {photos.length}
          </p>
        )}

        <button
          type="button"
          onClick={() => step(1)}
          disabled={photos.length < 2}
          aria-label="Next photo"
          className="grid size-11 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-text disabled:opacity-40"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </dialog>
  )
}
