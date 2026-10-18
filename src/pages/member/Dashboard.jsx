import { useAuth } from '../../context/useAuth'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <>
      <PageHeader
        title={`Welcome, ${profile?.full_name ?? 'member'}`}
        description="Your projects live here. Upload one and the club team reviews it before it goes public."
      />
      <EmptyState
        title="No projects yet"
        description="Upload your first project and it will appear here as pending."
      />
    </>
  )
}
