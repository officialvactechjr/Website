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
