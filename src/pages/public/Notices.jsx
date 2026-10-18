import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import NoticeList from '../../features/notices/components/NoticeList'

export default function Notices() {
  return (
    <Section>
      <PageHeader title="Notices" description="Official announcements from the club team." />
      <NoticeList emptyDescription="No notices yet. Check back soon." />
    </Section>
  )
}
