import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import LeaderboardList from '../../features/leaderboard/components/LeaderboardList'

export default function Contributors() {
  return (
    <Section>
      <PageHeader
        title="Top contributors"
        description="Points are added by the club team for workshops, projects and other help."
      />
      <LeaderboardList />
    </Section>
  )
}
