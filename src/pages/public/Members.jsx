import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import MemberGrid from '../../features/members/components/MemberGrid'

export default function Members() {
  return (
    <Section>
      <PageHeader title="Members" description="Name, class and GitHub of the club's members." />
      <MemberGrid />
    </Section>
  )
}
