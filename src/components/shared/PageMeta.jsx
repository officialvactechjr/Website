import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaFor, SITE, SITE_NAME } from '../../lib/meta'

/** Upserts one `<meta>` by its `name` or `property`. */
function upsertMeta(key, value, useProperty = false) {
  const attr = useProperty ? 'property' : 'name'
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', value)
}

/** Private routes that must never appear in a search index. */
const PRIVATE = ['/admin', '/member', '/profile', '/login', '/change-password']

/**
 * Sets the browser tab's title, the description and the share tags for the route
 * that is open. Mounted once, just inside the router, so every page is covered —
 * including the admin panel and the 404.
 */
export default function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description } = metaFor(pathname)
    const full = pathname === '/' ? title : `${title} · ${SITE_NAME}`
    const url = `${SITE}/${pathname === '/' ? '' : pathname}`

    document.title = full
    upsertMeta('description', description)
    // The panel, the member area and the auth pages stay out of search results.
    // `robots.txt` disallows them as well, but that only stops crawling — a
    // linked URL can still be listed, so the page has to say no itself.
    upsertMeta(
      'robots',
      PRIVATE.some((p) => pathname === p || pathname.startsWith(`${p}/`))
        ? 'noindex, nofollow'
        : 'index, follow',
    )
    upsertMeta('og:title', full, true)
    upsertMeta('og:description', description, true)
    upsertMeta('og:url', url, true)
    upsertMeta('twitter:title', full)
    upsertMeta('twitter:description', description)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [pathname])

  return null
}
