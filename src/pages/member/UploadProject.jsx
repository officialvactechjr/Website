import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import ProjectForm from '../../features/projects/components/ProjectForm'
import { useCreateProject } from '../../features/projects/hooks'
import { useAuth } from '../../context/useAuth'

export default function UploadProject() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const create = useCreateProject()

  async function onSubmit(values) {
    await create.mutateAsync({
      ownerId: profile.id,
      title: values.title,
      description: values.description,
      imageUrl: values.image_url,
      githubUrl: values.github_url,
    })
    navigate('/member')
  }

  return (
    <Section>
      <PageHeader
        title="Upload a project"
        description="It goes to the club team first. Only approved projects appear publicly."
      />
      <ProjectForm
        submitLabel="Send for approval"
        onSubmit={onSubmit}
        notice={
          <p className="rounded-sm border border-border px-3 py-2 text-sm text-muted">
            You can still see it here while it waits. If something needs changing, the team leaves a
            note on it.
          </p>
        }
      />
    </Section>
  )
}
