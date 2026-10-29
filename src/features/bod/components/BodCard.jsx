import { cn, initials } from '../../../lib/utils'

/**
 * One board member: a portrait card with the photo behind, the name and the
 * position over a navy gradient, and the two diagonal corner marks.
 *
 * `featured` is the president's card — a larger square that sits in the middle
 * of the top row.
 */
export default function BodCard({ member, featured = false }) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border-strong bg-surface-alt',
        // Capped in vw as well as rem, so two cards still fit side by side on a phone.
        featured ? 'aspect-square w-[min(18rem,60vw)]' : 'aspect-[4/5] w-[min(15rem,42vw)]',
      )}
    >
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={`Photo of ${member.full_name}`}
          width={400}
          height={500}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-4xl font-semibold text-border-strong"
        >
          {initials(member.full_name)}
        </div>
      )}

      {/* Keeps the name readable over any photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-bg via-bg/75 to-transparent"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 size-5 rounded-tr-md border-t border-r border-accent-soft/45"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-3 size-5 rounded-bl-md border-b border-l border-accent-soft/45"
      />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3
          className={cn(
            'font-bold text-white [text-shadow:0_1px_8px_rgb(6_18_42/0.6)]',
            featured ? 'text-xl' : 'text-lg',
          )}
        >
          {member.full_name}
        </h3>
        <p className="mt-1 text-[11px] font-medium tracking-[0.14em] text-white/75 uppercase">
          {member.position}
        </p>
      </div>
    </article>
  )
}
