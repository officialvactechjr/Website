import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldAlert } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ErrorState from '../../components/ui/ErrorState'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/ui/Spinner'
import { useSaveSettings, useSettings } from '../../features/settings/hooks'
import { settingsSchema } from '../../features/settings/schema'

const EMPTY = {
  site_name: '',
  contact_email: '',
  location: '',
  facebook_url: '',
  instagram_url: '',
  github_url: '',
}

export default function Settings() {
  const { data, isPending, isError, refetch } = useSettings()
  const save = useSaveSettings()

  const values = {
    site_name: data?.site_name ?? '',
    contact_email: data?.contact_email ?? '',
    location: data?.location ?? '',
    facebook_url: data?.facebook_url ?? '',
    instagram_url: data?.instagram_url ?? '',
    github_url: data?.github_url ?? '',
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(settingsSchema), values: values ?? EMPTY })

  return (
    <>
      <PageHeader title="Settings" description="The club details that appear on the public site." />

      <div
        role="note"
        className="mb-6 flex max-w-prose items-start gap-3 rounded-sm border border-warning px-4 py-3 text-sm text-warning"
      >
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Everything on this page is <span className="font-semibold">public</span> — any visitor can
          read it. Never put a password, an API key, a personal email address or a phone number
          here. Secrets live in the Supabase function settings, not in this table.
        </p>
      </div>

      {isPending && (
        <div className="grid place-items-center py-24">
          <Spinner />
        </div>
      )}

      {isError && <ErrorState message="We could not load the settings." onRetry={refetch} />}

      {!isPending && !isError && (
        <form
          onSubmit={handleSubmit((formValues) => save.mutate({ values: formValues }))}
          noValidate
          className="flex max-w-2xl flex-col gap-6"
        >
          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold">The club</h2>
            <Input label="Club name" error={errors.site_name?.message} {...register('site_name')} />
            <Input
              label="Where the club meets"
              hint="For example: Vishwa Adarsha Academy, +2 section."
              error={errors.location?.message}
              {...register('location')}
            />
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold">Contact</h2>
            <Input
              label="Club email"
              type="email"
              hint="The club's own address. It becomes readable by everyone."
              error={errors.contact_email?.message}
              {...register('contact_email')}
            />
            <p className="text-xs text-muted">
              The contact page shows the club name, this email and the location. Emptying a field
              removes it from the site.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-semibold">Social links</h2>
            <Input
              label="Facebook"
              placeholder="https://facebook.com/…"
              error={errors.facebook_url?.message}
              {...register('facebook_url')}
            />
            <Input
              label="Instagram"
              placeholder="https://instagram.com/…"
              error={errors.instagram_url?.message}
              {...register('instagram_url')}
            />
            <Input
              label="GitHub"
              placeholder="https://github.com/…"
              error={errors.github_url?.message}
              {...register('github_url')}
            />
          </Card>

          <div>
            <Button type="submit" loading={save.isPending} disabled={!isDirty}>
              Save public details
            </Button>
          </div>
        </form>
      )}
    </>
  )
}
