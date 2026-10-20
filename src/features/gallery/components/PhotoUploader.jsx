import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { imageFileError, uploadImage } from '../../storage/api'
import { useCreateGalleryPhotos } from '../hooks'

const BUCKET = 'gallery'

/**
 * Pick several photos at once, give them one title and an optional event.
 * Validation happens before anything is uploaded, so a bad file does not leave
 * half the batch in storage.
 */
export default function PhotoUploader({ events, onDone, onCancel }) {
  const createPhotos = useCreateGalleryPhotos()
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [eventId, setEventId] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(submitEvent) {
    submitEvent.preventDefault()
    setError(null)

    if (files.length === 0) {
      setError('Choose at least one photo.')
      return
    }

    const problem = files.map(imageFileError).find(Boolean)
    if (problem) {
      setError(problem)
      return
    }

    setBusy(true)
    try {
      const rows = []
      for (const file of files) {
        const imageUrl = await uploadImage(BUCKET, file)
        rows.push({
          title: title.trim() || null,
          image_url: imageUrl,
          event_id: eventId || null,
        })
      }
      createPhotos.mutate(rows, { onSuccess: onDone })
    } catch (uploadProblem) {
      setError(uploadProblem.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        label="Title"
        name="photo-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        hint="Used for every photo in this batch. You can leave it blank."
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo-event" className="text-sm font-medium text-text">
          Event
        </label>
        <select
          id="photo-event"
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="h-11 rounded-sm border border-border bg-surface px-3 text-text focus:border-primary"
        >
          <option value="">Not linked to an event</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photo-files" className="text-sm font-medium text-text">
          Photos
        </label>
        <input
          id="photo-files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setFiles([...event.target.files])}
          className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-4 file:py-2 file:text-sm file:font-medium file:text-text"
        />
        <p className="text-xs text-muted">
          {files.length > 0
            ? `${files.length} photo${files.length === 1 ? '' : 's'} ready. JPEG, PNG or WebP, up to 2 MB each.`
            : 'JPEG, PNG or WebP, up to 2 MB each. Large photos are shrunk for you.'}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-sm border border-danger px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy || createPhotos.isPending}>
          Add photos
        </Button>
      </div>
    </form>
  )
}
