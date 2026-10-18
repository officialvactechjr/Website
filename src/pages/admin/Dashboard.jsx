import { useAuth } from '../../context/useAuth'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Counts and recent activity will appear here as the panel is built."
      />
      <Card>
        <p className="text-sm text-muted">
          Signed in as <span className="text-text">{profile?.full_name}</span> with the role{' '}
          <span className="font-mono text-xs text-primary-text">{profile?.role}</span>.
        </p>
      </Card>
    </>
  )
}
