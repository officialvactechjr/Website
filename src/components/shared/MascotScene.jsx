import { cn } from '../../lib/utils'
import particles from '../../assets/hero/particles.webp'

/**
 * The mascot centred inside its own halo with the club's floating objects around
 * it — the composition the reference art uses.
 *
 * The objects are one packed sheet (`particles.webp`). It sits at the container's
 * full width, centred vertically, so the objects fan out either side of the
 * mascot instead of drifting off with the viewport. `spread` widens that band
 * (it scales the objects with it).
 *
 * - `glow={false}` leaves the halo to the caller — the landing wants one across
 *   the whole hero, not just the mascot's box.
 * - `animate` drifts the objects in from the centre (see `.hero-particles`).
 *
 * Put the mascot in as the child; size it with `h-[…%]` (or `max-h`/`max-w`).
 */
export default function MascotScene({
  children,
  className,
  spread = '112%',
  glow = true,
  animate = false,
}) {
  return (
    <div className={cn('relative', glow && 'hero-glow', className)}>
      <img
        src={particles}
        alt=""
        aria-hidden="true"
        width={2048}
        height={1151}
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 max-w-none',
          animate ? 'hero-particles' : '-translate-x-1/2 -translate-y-1/2',
        )}
        style={{ width: spread }}
      />
      <div className="relative flex size-full items-center justify-center">{children}</div>
    </div>
  )
}
