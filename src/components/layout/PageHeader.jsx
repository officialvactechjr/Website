import Breadcrumbs from '../ui/Breadcrumbs'

/**
 * Every page's title block. A breadcrumb trail sits above it by default, derived
 * from the URL — pass `breadcrumbs` to override (detail pages use the real title)
 * or `breadcrumbs={null}` to hide it.
 */
export default function PageHeader({ title, description, action, breadcrumbs }) {
  const trail = breadcrumbs === undefined ? undefined : breadcrumbs

  return (
    <div className="mb-6">
      {trail !== null && <Breadcrumbs items={trail} />}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {description && <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
