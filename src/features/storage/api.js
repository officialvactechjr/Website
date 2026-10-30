// Supabase Storage calls live here, never in a component. The upload rules match
// migration 0004's bucket settings, so the UI fails early with a plain message
// instead of a raw storage error.
import { supabase } from '../../lib/supabaseClient'

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_BYTES = 2 * 1024 * 1024
export const MAX_DECODE_BYTES = 15 * 1024 * 1024
export const MAX_EDGE = 1600

/**
 * Type and "too big to even open" only. The 2 MB limit is checked after the
 * resize instead, because shrinking to MAX_EDGE is what brings a phone photo
 * under it — rejecting on the raw size first would make resizing pointless.
 */
export function imageFileError(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" is not an image we can use. Use a JPEG, PNG or WebP.`
  }
  if (file.size > MAX_DECODE_BYTES) {
    return `"${file.name}" is too large to open. Please use an image under 15 MB.`
  }
  return null
}

/**
 * Downscale to MAX_EDGE on the long side, and re-encode when the file is simply
 * heavy. Keeps the type, so PNG stays PNG.
 * `shortcut:` a PNG over 2 MB with no transparency to spare will still be over
 * the limit after this, because re-encoding a lossless image barely shrinks it.
 * Convert to JPEG for those if it ever bites.
 */
async function shrink(file, maxEdge = MAX_EDGE) {
  if (typeof createImageBitmap !== 'function') return file

  const bitmap = await createImageBitmap(file)
  const longest = Math.max(bitmap.width, bitmap.height)

  // Under the cap and light enough: send the original bytes untouched, so a
  // cover that already exists is never re-compressed.
  if (longest <= maxEdge && file.size <= MAX_BYTES) {
    bitmap.close?.()
    return file
  }

  const scale = Math.min(1, maxEdge / longest)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type, 0.85))
  return blob ?? file
}

/**
 * Uploads one image and returns its public URL.
 * `folder` is the signed-in member's id: the `project-images` and `avatars`
 * policies only allow a write inside `{userId}/`, so member uploads must pass it.
 * `maxEdge` narrows the long side (the Home event strip passes 1200).
 */
export async function uploadImage(bucket, file, folder, maxEdge = MAX_EDGE) {
  const problem = imageFileError(file)
  if (problem) throw new Error(problem)

  const prepared = await shrink(file, maxEdge)
  if (prepared.size > MAX_BYTES) {
    throw new Error(`"${file.name}" is still over the 2 MB limit. Please pick a smaller image.`)
  }

  const extension = (prepared.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  const name = `${crypto.randomUUID()}.${extension}`
  const path = folder ? `${folder}/${name}` : name

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, prepared, { contentType: prepared.type, upsert: false })

  if (error) {
    if (import.meta.env.DEV) console.error(error)
    throw new Error('The upload did not finish. Please try again.')
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

const PUBLIC_MARKER = '/storage/v1/object/public/'

/** { bucket, path } for one of our own public files, or null for anything else. */
export function storageLocation(url) {
  if (typeof url !== 'string') return null

  const at = url.indexOf(PUBLIC_MARKER)
  if (at === -1) return null

  const rest = url.slice(at + PUBLIC_MARKER.length).split('?')[0]
  const slash = rest.indexOf('/')
  if (slash === -1) return null

  return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1)) }
}

/**
 * Best effort: a file that cannot be removed must never block deleting the row.
 * `shortcut:` a failed removal leaves an orphaned file with only a dev-console
 * trace — see MEMORY known issues. Upgrade with a storage sweep job if it ever
 * accumulates.
 */
export async function removeImageByUrl(url) {
  const found = storageLocation(url)
  if (!found) return // seed placeholders and outside links are not ours

  const { error } = await supabase.storage.from(found.bucket).remove([found.path])
  if (error && import.meta.env.DEV) console.error(error)
}
