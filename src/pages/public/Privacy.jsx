import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'

/**
 * Privacy policy. The club handles student names, classes, emails and photos, so
 * this page matters — but the wording is the school's to approve. The headings
 * below are the shape; `docs/OWNER-ACTIONS.md` lists this as an owner action.
 */
export default function Privacy() {
  return (
    <Section>
      <PageHeader
        title="Privacy policy"
        description="What the club keeps about its members, and who can see it."
      />
      <div className="max-w-prose">
        <p className="text-sm text-muted">
          Replace the paragraphs below with the club&apos;s own wording, then remove this line.
        </p>
        <h2 className="mt-8 font-semibold">What is kept</h2>
        <p className="mt-2 text-sm text-muted">
          A member&apos;s name, class, section, email and phone, plus anything they send with an
          application or a project. Email and phone are visible only to the club team.
        </p>
        <h2 className="mt-6 font-semibold">What is public</h2>
        <p className="mt-2 text-sm text-muted">
          A member&apos;s name, class and GitHub link may appear on the public pages, and only after
          they tick the consent box on the membership form.
        </p>
        <h2 className="mt-6 font-semibold">How to have it corrected or removed</h2>
        <p className="mt-2 text-sm text-muted">
          Ask the club team, or use the contact page. A named data owner is responsible for these
          records.
        </p>
      </div>
    </Section>
  )
}
