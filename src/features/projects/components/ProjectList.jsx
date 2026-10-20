import ProjectCard from './ProjectCard'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import { useProjects } from '../hooks'
import { cn } from '../../../lib/utils'

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-sm border border-border bg-surface">
          <div className="aspect-video w-full animate-pulse rounded-t-sm bg-surface-alt" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-surface-alt" />
            <div className="h-3 w-full animate-pulse rounded-sm bg-surface-alt" />
            <div className="h-3 w-1/2 animate-pulse rounded-sm bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProjectList({
  limit,
  emptyDescription = 'No projects have been approved yet. Check back soon.',
  // The landing page shows the preview in a narrow column, so it passes a
  // single-column grid instead of the default.
  columns = 'sm:grid-cols-2 lg:grid-cols-3',
}) {
  const { data, isPending, isError, refetch } = useProjects(limit ? { limit } : undefined)

  if (isPending) return <Skeleton />
  if (isError)
    return <ErrorState message="We could not load projects right now." onRetry={refetch} />
  if (!data?.length) return <EmptyState title="No projects yet" description={emptyDescription} />

  return (
    <div className={cn('grid gap-6', columns)}>
      {data.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
