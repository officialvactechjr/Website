import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'
import Card from '../../components/ui/Card'

// The real form, with its open/close window, arrives in Phase 5. No countdown
// and no invented dates until then.
export default function Join() {
  return (
    <Section>
      <PageHeader
        title="Join the club"
        description="Membership opens for a short window, then closes automatically."
      />

      <Card className="max-w-prose">
        <h2 className="font-semibold">Registration opens soon.</h2>
        <p className="mt-2 text-sm text-muted">
          When the club team opens the membership window, the form appears here with a clear closing
          time. After approval you get an email and a temporary password from the team, and you
          choose your own password on your first login.
        </p>
      </Card>
    </Section>
  )
}
