import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import EventList from '../../features/events/components/EventList'
import { cn } from '../../lib/utils'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
]

export default function Events() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'past' ? 'past' : 'upcoming'

  return (
    <Section>
      <PageHeader
        title="Events and workshops"
        description="What is coming up, and everything the club has already run."
      />

      <div
        role="tablist"
        aria-label="Event lists"
        className="mb-6 flex gap-6 border-b border-border"
      >
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setParams(item.key === 'past' ? { tab: 'past' } : {}, { replace: true })}
            className={cn(
              'border-b-2 pb-2.5 text-sm font-medium transition-colors',
              tab === item.key
                ? 'border-primary text-text'
                : 'border-transparent text-muted hover:text-text',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <EventList
        upcoming={tab === 'upcoming'}
        emptyDescription={
          tab === 'upcoming' ? 'No upcoming events yet. Check back soon.' : 'No past events yet.'
        }
      />
    </Section>
  )
}
