import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

// Pixels per second the loop travels, and the floor for a very short strip.
const SPEED = 60
const MIN_DURATION = 20

/**
 * One reusable horizontal strip, shared by the board/committee band and the Home
 * events row. Nothing but a CSS transform moves (no animation library).
 *
 * - **Auto** (motion allowed, and enough items to fill the width): one copy of
 *   `items` loops past on a transform, with a second, `aria-hidden` and `inert`
 *   copy behind it so the -50% shift lands on the seam and the loop is invisible.
 * - It pauses on hover, on keyboard focus inside it, while the user touches or
 *   drags it. Touch users can still drag it by hand — the viewport is a real
 *   scroller.
 * - **Too few items to fill the width**: no loop, no duplicate copy, no
 *   animation — just a short row.
 * - **`prefers-reduced-motion`**: no auto-scroll at all; a scroll-snap row with
 *   previous/next buttons.
 *
 * `items` is the array of `<li>` cards; this component owns the track and the
 * duplicated copy.
 */
export default function HorizontalMarquee({ items, ariaLabel, className }) {
  const scroller = useRef(null)
  const copy = useRef(null)
  const [reduced, setReduced] = useState(
    () =>
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [engaged, setEngaged] = useState(false)
  const [width, setWidth] = useState(0) // width of one copy
  const [view, setView] = useState(0) // width of the window it scrolls in

  // Follow the setting if it changes while the page is open.
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Loop only when one copy is wider than the window. Measured, not guessed, so
  // a strip with three cards on a wide screen simply does not move.
  useEffect(() => {
    const viewEl = scroller.current
    const copyEl = copy.current
    if (!viewEl || !copyEl) return undefined

    const measure = () => {
      setWidth(copyEl.scrollWidth)
      setView(viewEl.clientWidth)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(viewEl)
    observer.observe(copyEl)
    return () => observer.disconnect()
  }, [])

  const loops = !reduced && view > 0 && width > view
  const moving = loops && !engaged
  const duration = Math.max(MIN_DURATION, Math.round(width / SPEED))

  function scrollByCards(direction) {
    const step = copy.current?.firstElementChild?.getBoundingClientRect().width ?? 320
    scroller.current?.scrollBy({ left: direction * (step + 16), behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scroller}
        role="group"
        aria-label={ariaLabel}
        // Pointer events cover mouse, touch and pen, and a touch does not fire
        // the compatibility mouse events that would otherwise leave it paused.
        onPointerEnter={(event) => event.pointerType === 'mouse' && setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onPointerDown={() => setEngaged(true)}
        onPointerUp={() => setEngaged(false)}
        onPointerCancel={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
        className={cn(
          // A real horizontal scroller, so touch users can drag it by hand. The
          // scrollbar is hidden; the fade edges are a mask.
          // shortcut: while auto-scrolling is paused mid-loop, a long drag to the
          // far edge can run past the duplicate copy into empty space. Add a drag
          // clamp if it ever shows; a short swipe never reaches it.
          'overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:[mask-image:none]',
          reduced && 'snap-x snap-mandatory [&_li]:snap-start',
        )}
      >
        <div
          className={cn('flex items-stretch', !loops && 'justify-center')}
          style={
            loops
              ? {
                  width: 'max-content',
                  animation: `vac-marquee ${duration}s linear infinite`,
                  animationPlayState: moving ? 'running' : 'paused',
                }
              : undefined
          }
        >
          <ul ref={copy} className="flex w-max items-stretch">
            {items}
          </ul>
          {loops && (
            <ul aria-hidden="true" inert className="flex w-max items-stretch">
              {items}
            </ul>
          )}
        </div>
      </div>

      {reduced && items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous"
            className="absolute top-1/2 left-1 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-surface/90 text-text backdrop-blur transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next"
            className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-surface/90 text-text backdrop-blur transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}
