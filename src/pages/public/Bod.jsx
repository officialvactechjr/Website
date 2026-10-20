import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import BodGrid from '../../features/bod/components/BodGrid'

export default function Bod() {
  return (
    <Section>
      <PageHeader
        title="Board of directors"
        description="The students who run the club this year."
      />
      <BodGrid />
    </Section>
  )
}
