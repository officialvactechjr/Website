import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Upload } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/useAuth'
import { useDeleteProject, useMyProjects } from '../../features/projects/hooks'
import { removeImageByUrl } from '../../features/storage/api'
import { formatDate } from '../../lib/utils'
import { useState } from 'react'

const STATUS = {
  pending: { label: 'Waiting for review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Needs changes', variant: 'danger' },
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useMyProjects(profile.id)
  const remove = useDeleteProject()
  const [pendingDelete, setPendingDelete] = useState(null)

  const projects = data ?? []
  const approved = projects.filter((project) => project.status === 'approved').length

  async function confirmDelete() {
    const project = pendingDelete
    setPendingDelete(null)
    await remove.mutateAsync(project.id)
    // Best effort: the row is gone either way. See MEMORY known issues.
    await removeImageByUrl(project.image_url)
  }

  return (
    <Section>
      <PageHeader
        title="My projects"
        description="Everything you uploaded, and where it stands."
        action={
          <Button as={Link} to="/member/projects/new">
            <Upload className="size-4" aria-hidden="true" />
            Upload project
          </Button>
        }
      />

      {isPending && (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load your projects." onRetry={refetch} />}

      {!isPending && !isError && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Upload one and the club team will review it. Approved projects appear on the public projects page."
          action={
            <Button as={Link} to="/member/projects/new">
              Upload your first project
            </Button>
          }
        />
      )}

      {!isPending && !isError && projects.length > 0 && (
        <>
          <p className="mb-6 text-sm text-muted">
            {approved} of {projects.length} {projects.length === 1 ? 'project is' : 'projects are'}{' '}
            approved and visible to visitors.
          </p>

          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const status = STATUS[project.status]
              return (
                <li key={project.id}>
                  <Card className="flex h-full flex-col gap-3">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt=""
                        width="640"
                        height="360"
                        loading="lazy"
                        className="-mt-1 aspect-video w-full rounded-sm border border-border object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="grid aspect-video w-full place-items-center rounded-sm border border-dashed border-border-strong text-xs text-muted"
                      >
                        No image
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold">{project.title}</h2>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <p className="line-clamp-3 text-sm text-muted">{project.description}</p>

                    {project.status === 'rejected' && project.review_note && (
                      <p className="rounded-sm border border-danger px-3 py-2 text-sm text-danger">
                        <span className="font-medium">Why: </span>
                        {project.review_note}
                      </p>
                    )}

                    <p className="mt-auto font-mono text-xs text-muted">
                      Uploaded {formatDate(project.created_at)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/member/projects/${project.id}/edit`)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPendingDelete(project)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete this project?"
        itemName={pendingDelete?.title}
        loading={remove.isPending}
      />
    </Section>
  )
}
