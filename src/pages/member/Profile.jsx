import { useAuth } from '../../context/useAuth'
import PasswordForm from '../../features/auth/PasswordForm'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm">{value || <span className="text-muted">Not set</span>}</dd>
    </div>
  )
}

export default function Profile() {
  const { profile } = useAuth()

  return (
    <>
      <PageHeader
        title="My profile"
        description="Your password changes straight away. Name, class, section, email and phone need a club admin to approve them — those requests arrive in Phase 6."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Account</h2>
          <dl>
            <Row label="Name" value={profile?.full_name} />
            <Row label="Class" value={profile?.class} />
            <Row label="Section" value={profile?.section} />
            <Row
              label="GitHub"
              value={
                profile?.github_url ? (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-text underline"
                  >
                    {profile.github_url}
                  </a>
                ) : null
              }
            />
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Password</h2>
          <PasswordForm />
        </Card>
      </div>
    </>
  )
}
