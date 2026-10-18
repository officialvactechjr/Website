import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import { useSettings } from '../../features/settings/hooks'

/** Settings values are free-form; only plain strings are worth showing. */
const asText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)

export default function Contact() {
  const { data, isPending, isError, refetch } = useSettings()

  const rows = data
    ? [
        { label: 'Club', value: asText(data.site_name) },
        { label: 'Email', value: asText(data.contact_email) },
        { label: 'Where', value: asText(data.location) },
      ].filter((row) => row.value)
    : []

  return (
    <Section>
      <PageHeader title="Contact" description="How to reach the club team." />

      {isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load the contact details." onRetry={refetch} />}

      {!isPending && !isError && rows.length === 0 && (
        <Card className="max-w-prose">
          <p className="text-sm text-muted">
            The club team has not published contact details yet. Ask a club member, or look out for
            the next notice.
          </p>
        </Card>
      )}

      {rows.length > 0 && (
        <Card className="max-w-prose">
          <dl>
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap justify-between gap-x-4 border-t border-border py-2.5 first:border-t-0"
              >
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </Section>
  )
}
