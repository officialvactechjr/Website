import PageHeader from '../../components/layout/PageHeader'
import Section from '../../components/layout/Section'

/**
 * Terms and conditions. The headings are the club's to fill in — this is a
 * student club site, so a short, honest page is better than invented legalese.
 * `docs/OWNER-ACTIONS.md` lists this as an owner action.
 */
export default function Terms() {
  return (
    <Section>
      <PageHeader
        title="Terms and conditions"
        description="The rules for using this site. Written by the club team."
      />
      <div className="max-w-prose">
        <p className="text-sm text-muted">
          Replace the paragraphs below with the club&apos;s own wording, then remove this line.
        </p>
        <h2 className="mt-8 font-semibold">Who may use the site</h2>
        <p className="mt-2 text-sm text-muted">
          Accounts belong to one student each and are handed over by the club team in person. Do not
          share a login.
        </p>
        <h2 className="mt-6 font-semibold">What you publish</h2>
        <p className="mt-2 text-sm text-muted">
          Projects, photos and details you send stay yours. By sending them you agree the club may
          show them on this site and in club materials.
        </p>
        <h2 className="mt-6 font-semibold">What the club may remove</h2>
        <p className="mt-2 text-sm text-muted">
          The club team may edit or remove anything that breaks school rules, upsets other students
          or is off topic.
        </p>
      </div>
    </Section>
  )
}
