import Section from '../../../components/layout/Section'
import CenterHeading from '../../../components/layout/CenterHeading'
import BodCard from './BodCard'
import { isCommitteeHead } from '../positions'
import { useBodMembers } from '../hooks'

/**
 * The committee heads (a position containing "Head"), as a centred row of cards.
 * Renders nothing until the club adds them — the section appears on its own.
 */
export default function CommitteeHeads() {
  const { data } = useBodMembers()
  const heads = (data ?? []).filter((member) => isCommitteeHead(member.position))

  if (!heads.length) return null

  return (
    <Section className="border-b border-border">
      <CenterHeading
        title="Head of Committees"
        description="The students leading each of the club’s committees."
      />
      <ul className="flex flex-wrap justify-center gap-6 lg:gap-8">
        {heads.map((member) => (
          <li key={member.id}>
            <BodCard member={member} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
