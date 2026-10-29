import { useEffect, useState } from 'react'
import { ArrowUp, Cookie, Phone } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const SEEN = 'vacCookieNotice'

/**
 * The site's furniture: a "skip to content" link for keyboard users, a back-to-top
 * button once the page has scrolled, and a one-off note about the cookie the login
 * needs. All three are presentation only — the session cookie is Supabase's.
 */
export default function SiteChrome() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  // Read once, lazily: no effect, so nothing cascades on mount.
  const [notice, setNotice] = useState(() => {
    try {
      return localStorage.getItem(SEEN) !== '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // A new page starts at the top of the page, not the middle of it.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  function dismiss() {
    try {
      localStorage.setItem(SEEN, '1')
    } catch {
      // Private mode: the note simply shows again next time.
    }
    setNotice(false)
  }

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:border focus:border-primary focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-text"
      >
        Skip to content
      </a>

      {notice && (
        <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-[42rem] flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface p-4 text-sm shadow-lg">
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
        className={cn(
          'fixed right-4 bottom-4 z-40 flex flex-col gap-2 transition-opacity ease-assemble',
          scrolled ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <Button
          as={Link}
          to="/contact"
          variant="secondary"
          size="sm"
          shape="pill"
          aria-label="Contact the club"
          className="size-11 justify-center border-border-strong bg-surface p-0"
        >
          <Phone className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="size-11 justify-center border-border-strong bg-surface p-0"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </>
  )
}
