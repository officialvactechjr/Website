import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import ProjectList from '../../features/projects/components/ProjectList'

export default function Projects() {
  return (
    <Section>
      <PageHeader
        title="Built by members"
        description="Every project is checked by the club team before it appears here."
      />
      <ProjectList />
    </Section>
  )
}
