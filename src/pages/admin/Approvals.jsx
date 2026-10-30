import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/layout/PageHeader'
import RefreshButton from '../../components/shared/RefreshButton'
import Spinner from '../../components/ui/Spinner'
import Textarea from '../../components/ui/Textarea'
import { useAuth } from '../../context/useAuth'
import { useDecideProject, useReviewQueue } from '../../features/projects/hooks'
import { cn, formatDate } from '../../lib/utils'

const TABS = [
  { key: 'pending', label: 'Waiting' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function Approvals() {
  const { profile } = useAuth()
  const [status, setStatus] = useState('pending')
  const { data, isPending, isError, refetch, isFetching } = useReviewQueue(status)
  const decide = useDecideProject()
  const [rejecting, setRejecting] = useState(null)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState(null)

  function confirmReject() {
    if (note.trim().length < 3) {
      setNoteError('Write a short reason. The member sees it.')
      return
    }
    decide.mutate(
      {
        id: rejecting.id,
        status: 'rejected',
        reviewNote: note.trim(),
        reviewedBy: profile?.id ?? null,
      },
      {
        onSuccess: () => {
          setRejecting(null)
          setNote('')
          setNoteError(null)
        },
      },
    )
  }

  return (
    <>
      <PageHeader
        title="Project approvals"
        description="Every upload waits here until someone on the team reads it."
        action={<RefreshButton onRefresh={refetch} refreshing={isFetching} />}
      />

      <div
        role="tablist"
        aria-label="Project status"
        className="mb-6 flex gap-6 border-b border-border"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={status === tab.key}
            onClick={() => setStatus(tab.key)}
            className={cn(
              'border-b-2 pb-2.5 text-sm font-medium transition-colors',
              status === tab.key
                ? 'border-primary text-text'
                : 'border-transparent text-muted hover:text-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load the project queue." onRetry={refetch} />}

      {!isPending && !isError && (data ?? []).length === 0 && (
        <EmptyState
          title={status === 'pending' ? 'Nothing waiting' : 'Nothing here'}
          description={
            status === 'pending'
              ? 'New uploads appear here as soon as members send them.'
              : 'Projects you have decided on show up here.'
          }
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((project) => (
          <article
            key={project.id}
            className="flex flex-col rounded-sm border border-border bg-surface transition-colors hover:border-primary"
          >
            {project.image_url && (
              <img
                src={project.image_url}
                alt=""
                width={640}
                height={360}
                loading="lazy"
                className="aspect-video w-full rounded-t-sm object-cover"
              />
            )}

            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-[17px] font-semibold">{project.title}</h2>
              {project.description && (
                <p className="mt-2 line-clamp-4 text-sm text-muted">{project.description}</p>
              )}

              <p className="mt-3 text-xs text-muted">
                <span className="font-medium text-text">{project.owner_name}</span>
                {project.owner_class && (
                  <>
                    {' · '}Class {project.owner_class}
                    {project.owner_section ? ` · ${project.owner_section}` : ''}
                  </>
                )}
                {' · '}
                {formatDate(project.created_at)}
              </p>

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-sm font-medium text-primary-text hover:underline"
                >
                  View the code
                </a>
              )}

              {project.review_note && (
                <p className="mt-3 rounded-sm border border-border bg-surface-alt px-3 py-2 text-xs text-muted">
                  {project.review_note}
                </p>
              )}

              {status === 'pending' && (
                <div className="mt-auto flex flex-wrap gap-3 pt-4">
                  <Button
                    size="sm"
                    loading={decide.isPending}
                    onClick={() =>
                      decide.mutate({
                        id: project.id,
                        status: 'approved',
                        reviewNote: null,
                        reviewedBy: profile?.id ?? null,
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setRejecting(project)}>
                    Reject
                  </Button>
                </div>
              )}

              {status !== 'pending' && (
                <p className="mt-auto pt-4">
                  <Badge variant={status === 'approved' ? 'success' : 'danger'}>
                    {status === 'approved' ? 'Approved' : 'Rejected'}
                  </Badge>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this project?"
        size="sm"
      >
        <p className="text-sm text-muted">
          “{rejecting?.title}” stays hidden. The member reads your reason and can fix the project
          and send it again.
        </p>
        <div className="mt-4">
          <Textarea
            label="Reason"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={noteError}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setRejecting(null)}
            disabled={decide.isPending}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject} loading={decide.isPending}>
            Reject
          </Button>
        </div>
      </Modal>
    </>
  )
}
