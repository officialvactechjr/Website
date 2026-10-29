import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import ProjectForm from '../../features/projects/components/ProjectForm'
import { useMyProject, useUpdateProject } from '../../features/projects/hooks'
import { removeImageByUrl } from '../../features/storage/api'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useMyProject(id)
  const update = useUpdateProject()

  if (isPending) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner />
      </div>
    )
  }

  // RLS answers with no row for someone else's project, so this is also the
  // "not yours" case.
  if (isError || !data) {
    return (
      <Section>
        <PageHeader title="Edit project" />
        <EmptyState
          title="We could not find that project"
          description="It may have been deleted, or it belongs to someone else."
          action={
            <Button variant="secondary" onClick={() => navigate('/member')}>
              Back to my projects
            </Button>
          }
        />
        {isError && (
          <ErrorState
            className="mt-4"
            message="The project could not be loaded."
            onRetry={refetch}
          />
        )}
      </Section>
    )
  }

  async function onSubmit(values) {
    const replacedImage = data.image_url && data.image_url !== values.image_url

    await update.mutateAsync({
      id,
      title: values.title,
      description: values.description,
      imageUrl: values.image_url,
      githubUrl: values.github_url,
    })

    if (replacedImage) await removeImageByUrl(data.image_url)
    navigate('/member')
  }

  return (
    <Section>
      <PageHeader title="Edit project" description={data.title} />
      <ProjectForm
        defaultValues={{
          title: data.title ?? '',
          description: data.description ?? '',
          image_url: data.image_url ?? '',
          github_url: data.github_url ?? '',
        }}
        submitLabel="Save changes"
        onSubmit={onSubmit}
        notice={
          <p className="rounded-sm border border-warning px-3 py-2 text-sm text-warning">
            Saving puts this back in the approval queue, even if it was approved before. It stays
            visible here in the meantime.
          </p>
        }
      />
    </Section>
  )
}
