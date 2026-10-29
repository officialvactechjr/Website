/** How the public pages describe a membership window. Pure logic, no network. */

/** The window accepting applications right now, if any. */
export function openWindow(windows, now = new Date()) {
  const time = now.getTime()
  return (
    (windows ?? []).find(
      (w) =>
        w.is_open &&
        new Date(w.opens_at).getTime() <= time &&
        time <= new Date(w.closes_at).getTime(),
    ) ?? null
  )
}

/** The next window that has not opened yet, soonest first. */
export function nextWindow(windows, now = new Date()) {
  const time = now.getTime()
  return (
    (windows ?? [])
      .filter((w) => new Date(w.opens_at).getTime() > time)
      .sort((a, b) => new Date(a.opens_at) - new Date(b.opens_at))[0] ?? null
  )
}

/** The most recently finished window, for "we last opened on …" copy. */
export function lastWindow(windows, now = new Date()) {
  const time = now.getTime()
  return (
    (windows ?? [])
      .filter((w) => new Date(w.closes_at).getTime() < time)
      .sort((a, b) => new Date(b.closes_at) - new Date(a.closes_at))[0] ?? null
  )
}

/** Everything a public page needs in one call. */
export function windowState(windows, now = new Date()) {
  const open = openWindow(windows, now)
  const next = nextWindow(windows, now)
  return { open, next, last: open ? null : lastWindow(windows, now) }
}

/** Whether a registration form is accepting answers at this moment. */
export function formState(form, eventStatus, now = new Date()) {
  if (!form) return 'missing'
  if (eventStatus && eventStatus !== 'published') return 'unavailable'
  const time = now.getTime()
  if (time < new Date(form.opens_at).getTime()) return 'not-yet'
  if (time > new Date(form.closes_at).getTime()) return 'closed'
  return 'open'
}
