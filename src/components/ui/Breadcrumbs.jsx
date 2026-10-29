import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTE_LABELS } from '../../lib/constants'

/**
 * The trail for the current path, built from ROUTE_LABELS.
 * Unknown segments (ids, mostly) are skipped, which is why detail pages pass
 * their own `items` instead.
 */
function trailFromPath(pathname) {
  const trail = []
  let path = ''

  for (const segment of pathname.split('/').filter(Boolean)) {
    path += `/${segment}`
    const label = ROUTE_LABELS[segment]
    if (label) trail.push({ label, to: path })
  }

  return trail
}

/** Home icon and chevrons are the supplied artwork; the colour comes from currentColor. */
export default function Breadcrumbs({ items }) {
  const { pathname } = useLocation()
  const trail = items ?? trailFromPath(pathname)

  if (trail.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-muted">
        <li>
          <Link
            to="/home"
            aria-label="Home"
            className="inline-flex rounded-md p-1 text-muted transition-colors duration-150 hover:text-text"
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M16 7.609c.352 0 .69.122.96.343l.111.1 6.25 6.25v.001a1.5 1.5 0 0 1 .445 1.071v7.5a.89.89 0 0 1-.891.891H9.125a.89.89 0 0 1-.89-.89v-7.5l.006-.149a1.5 1.5 0 0 1 .337-.813l.1-.11 6.25-6.25c.285-.285.67-.444 1.072-.444Zm5.984 7.876L16 9.5l-5.984 5.985v6.499h11.968z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth=".094"
              />
            </svg>
          </Link>
        </li>

        {trail.map((item, index) => {
          const isLast = index === trail.length - 1

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li aria-hidden="true" className="text-border-strong">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="m14.413 10.663-6.25 6.25a.939.939 0 1 1-1.328-1.328L12.42 10 6.836 4.413a.939.939 0 1 1 1.328-1.328l6.25 6.25a.94.94 0 0 1-.001 1.328"
                    fill="currentColor"
                  />
                </svg>
              </li>
              <li>
                {isLast || !item.to ? (
                  <span aria-current="page" className="font-semibold text-primary-text">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.to} className="transition-colors duration-150 hover:text-text">
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
