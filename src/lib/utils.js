import { format } from 'date-fns'

/** Join class names, dropping anything falsy. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Avatar fallback: "Alshan Rijal" -> "AR", "Alshan" -> "AL". */
export function initials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Dates read as "18 Oct 2026" everywhere (docs/DESIGN.md section 9). */
export function formatDate(value) {
  if (!value) return ''
  return format(new Date(value), 'dd MMM yyyy')
}

/**
 * A stored timestamp in the shape `<input type="datetime-local">` expects, in the
 * viewer's own time zone, so an admin types the time they mean.
 */
export function toDateTimeInput(value) {
  return value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : ''
}

/** The local value from a datetime-local input back to a stored timestamp. */
export function fromDateTimeInput(value) {
  return value ? new Date(value).toISOString() : null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Nepal is UTC+5:45 all year — there is no daylight saving — so a fixed offset is
// exact. That is why this needs no time-zone library.
const NEPAL_OFFSET_MINUTES = 5 * 60 + 45

function nepalClock(value) {
  return new Date(new Date(value).getTime() + NEPAL_OFFSET_MINUTES * 60 * 1000)
}

/** "18 Oct 2026" in Nepal time. */
export function formatNepalDate(value) {
  if (!value) return ''
  const clock = nepalClock(value)
  return `${clock.getUTCDate()} ${MONTHS[clock.getUTCMonth()]} ${clock.getUTCFullYear()}`
}

/** "18 Oct 2026, 10:00 AM" in Nepal time. */
export function formatNepalDateTime(value) {
  if (!value) return ''
  const clock = nepalClock(value)
  const hours24 = clock.getUTCHours()
  const hours = hours24 % 12 === 0 ? 12 : hours24 % 12
  const minutes = String(clock.getUTCMinutes()).padStart(2, '0')
  return `${formatNepalDate(value)}, ${hours}:${minutes} ${hours24 < 12 ? 'AM' : 'PM'}`
}

/**
 * Spreadsheet apps run a cell starting with = + - or @ as a formula, so a name
 * typed as "=SUM(1)" would execute when staff open the export. Prefixing an
 * apostrophe makes it literal text. (Tab and carriage return are in the same
 * family, so they get the same treatment.)
 */
export function csvCell(value) {
  const text = value == null ? '' : String(value)
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}
