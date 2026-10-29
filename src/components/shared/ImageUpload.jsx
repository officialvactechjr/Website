import { useRef, useState } from 'react'
import { Image } from 'lucide-react'
import Button from '../ui/Button'
import { uploadImage } from '../../features/storage/api'

/** One image: pick, shrink, upload, preview. Validation lives in storage/api.js. */
export default function ImageUpload({ bucket, folder, value, onChange, label = 'Image' }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function pick(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // so the same file can be picked again
    if (!file) return

    setError(null)
    setBusy(true)
    try {
      onChange(await uploadImage(bucket, file, folder))
    } catch (problem) {
      setError(problem.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}</span>

      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <img
            src={value}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            className="size-24 rounded-sm border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-24 place-items-center rounded-sm border border-dashed border-border-strong text-muted"
          >
            <Image className="size-6" />
          </span>
        )}

        <div className="flex flex-col items-start gap-2">
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={pick}
            className="sr-only"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={() => input.current?.click()}
          >
            {value ? 'Replace image' : 'Choose image'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              Remove
            </Button>
          )}
          <span className="text-xs text-muted">
            JPEG, PNG or WebP, up to 2 MB. Large photos are shrunk for you.
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
