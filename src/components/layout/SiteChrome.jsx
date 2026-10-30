import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Cookie, Phone } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const SEEN = 'vacCookieNotice'

// The two floating circles: 56px on a phone, 60 at `sm`, 64 at `lg`, 72 from
// 1920 — and 56 again on a window shorter than 500px. The size lives in the
// `.fab` rule in `index.css` (see the note there on Tailwind's breakpoint
// order); the icon is `size-[45%]`, so one number covers circle and glyph.
//
// The ring (not a border) is the "clearly visible light edge": `Button`'s own
// variant already sets `border-*`, and two utilities for one property would be
// a CSS-order coin flip.
// shortcut: the text labels beside the circles are lg-only, as asked; a phone
// gets the aria-label alone. Widen to `sm:` if a phone ever needs them.
const FAB =
  'fab group relative shrink-0 justify-center rounded-full p-0 ring-2 ring-white/60 shadow-lg shadow-black/50 transition duration-150 ease-assemble hover:scale-[1.06] hover:brightness-110 hover:ring-white/90 active:scale-[.96] focus-visible:outline-3 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100'

/** The hover/focus name shown beside a circle from `lg` up. Decorative: the
    button's own `aria-label` is the accessible name at every width. */
function FabLabel({ children }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-[calc(100%+0.75rem)] hidden -translate-y-1/2 rounded-md border border-border-strong bg-surface px-2.5 py-1 text-sm font-semibold whitespace-nowrap text-text opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
    >
      {children}
    </span>
  )
}

/**
 * The site's furniture: a "skip to content" link for keyboard users, the scroll
 * progress line, a Contact and a Back-to-top circle once the page has scrolled,
 * and a one-off note about the cookie the login needs. All of it is presentation
 * only — the session cookie is Supabase's.
 *
 * With the page's own scrollbar hidden (`index.css`), the progress line and the
 * Back to top circle are what tell you where you are.
 *
 * The line and the circles render on the public site only: never in the admin
 * panel, and the intro overlay (z-200) covers them while it plays.
 */
export default function SiteChrome() {
  const { pathname } = useLocation()
  const inAdmin = pathname.startsWith('/admin')
  const isLanding = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  // The landing opens on the hero, so its progress line waits until the page
  // actually moves.
  const [started, setStarted] = useState(false)
  const [noticeHeight, setNoticeHeight] = useState(0)
  // The progress line, written to directly — see the scroll handler below.
  const bar = useRef(null)
  // Read once, lazily: no effect, so nothing cascades on mount.
  const [notice, setNotice] = useState(() => {
    try {
      return localStorage.getItem(SEEN) !== '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 400)
      if (window.scrollY > 0) setStarted(true) // React ignores a repeat of true
      // The progress line is set on the node rather than through state: no
      // re-render per scroll frame, and `scaleX` costs no layout work.
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) {
        bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
      }
    }
    onScroll() // a reload can begin part-way down a page
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // A new page starts at the top of the page, not the middle of it.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // The floating buttons step over the cookie note while it is on screen.
  const noticeObserver = useRef(null)

  function measureNotice(element) {
    noticeObserver.current?.disconnect()
    noticeObserver.current = null
    if (!element) return
    const sync = () => setNoticeHeight(element.offsetHeight)
    sync()
    noticeObserver.current = new ResizeObserver(sync)
    noticeObserver.current.observe(element)
  }

  function dismiss() {
    try {
      localStorage.setItem(SEEN, '1')
    } catch {
      // Private mode: the note simply shows again next time.
    }
    setNotice(false)
  }

  function toTop() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:border focus:border-primary focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-text"
      >
        Skip to content
      </a>

      {/* What stands in for the page scrollbar as a position cue: 3px of accent
          that fills as you scroll. Presentational, so nothing is announced.
          Hidden in the admin panel, under `prefers-reduced-motion`, and on the
          landing until the page moves past the hero. It sits at the very top,
          below the notch inset, over the header's own background — never over
          its content. */}
      <div
        ref={bar}
        id="scroll-progress"
        aria-hidden="true"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)', transform: 'scaleX(0)' }}
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent',
          'motion-reduce:hidden',
          (inAdmin || (isLanding && !started)) && 'hidden',
        )}
      />

      {notice && (
        <div
          ref={measureNotice}
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[42rem] flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface p-4 text-sm shadow-lg"
        >
          <Cookie className="size-5 shrink-0 text-accent-soft" aria-hidden="true" />
          <p className="mr-auto text-muted">
            This site keeps one cookie so you stay signed in. Nothing is tracked or sold.
          </p>
          <Link to="/privacy" className="font-semibold text-accent-soft hover:underline">
            Privacy
          </Link>
          <Button variant="secondary" size="sm" onClick={dismiss}>
            Got it
          </Button>
        </div>
      )}

      <div
        id="site-furniture"
        style={
          notice
            ? { bottom: `calc(${noticeHeight}px + 1rem + env(safe-area-inset-bottom))` }
            : undefined
        }
        className={cn(
          'fixed z-40 flex flex-col items-end gap-[14px] transition-opacity ease-assemble sm:gap-4',
          // 16px from the edge on a phone, 24 at `sm`, 32 from `lg` — plus the
          // notch inset, so the circles never sit under it.
          'right-[max(1rem,env(safe-area-inset-right))] sm:right-[max(1.5rem,env(safe-area-inset-right))] lg:right-[max(2rem,env(safe-area-inset-right))]',
          !notice &&
            'bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] lg:bottom-[calc(2rem+env(safe-area-inset-bottom))]',
          scrolled ? 'opacity-100' : 'pointer-events-none opacity-0',
          inAdmin && 'hidden',
        )}
      >
        <Button
          as={Link}
          to="/contact"
          variant="brand"
          size="sm"
          shape="pill"
          aria-label="Contact"
          className={FAB}
        >
          <Phone className="size-[45%]" strokeWidth={2} aria-hidden="true" />
          <FabLabel>Contact</FabLabel>
        </Button>
        <Button
          variant="brand"
          size="sm"
          shape="pill"
          aria-label="Back to top"
          onClick={toTop}
          className={FAB}
        >
          <ArrowUp className="size-[45%]" strokeWidth={2} aria-hidden="true" />
          <FabLabel>Back to top</FabLabel>
        </Button>
      </div>
    </>
  )
}
