/**
 * Pure display: the parent passes `now` from `useNow`, so the numbers and the
 * open/closed state always agree.
 */
export default function WindowCountdown({ closesAt, now }) {
  const minutes = Math.max(0, Math.floor((new Date(closesAt).getTime() - now) / 60_000))
  const parts = [
    ['days', Math.floor(minutes / 1440)],
    ['hours', Math.floor((minutes % 1440) / 60)],
    ['minutes', minutes % 60],
  ]

  return (
    <div className="mt-6 flex gap-6" aria-live="off">
      {parts.map(([label, value]) => (
        <div key={label}>
          <p className="font-mono text-2xl tabular-nums">{String(value).padStart(2, '0')}</p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      ))}
    </div>
  )
}
