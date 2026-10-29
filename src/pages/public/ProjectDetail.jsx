import { useParams } from 'react-router-dom'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ErrorState from '../../components/ui/ErrorState'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import { useProject } from '../../features/projects/hooks'

export default function ProjectDetail() {
  const { id } = useParams()
  const { data, isPending, isError, refetch } = useProject(id)

  return (
    <Section tight>
      <Breadcrumbs
        items={[{ label: 'Projects', to: '/projects' }, { label: data?.title ?? 'Project' }]}
      />

      {isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState message="We could not load this project." onRetry={refetch} />
        </div>
      )}

      {data && (
        <article className="mt-6">
          {data.image_url && (
            <img
              src={data.image_url}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              className="aspect-video w-full rounded-sm border border-border object-cover"
            />
          )}

          <h1 className="mt-6 max-w-prose text-2xl font-semibold text-balance sm:text-3xl">
            {data.title}
          </h1>

          <p className="mt-3 text-sm text-muted">
            <span className="font-medium text-text">{data.owner_name}</span>
            {data.owner_class && (
              <>
                {' · '}Class {data.owner_class}
                {data.owner_section ? ` · ${data.owner_section}` : ''}
              </>
            )}
            {data.owner_github && (
              <>
                {' · '}
                <a
                  href={data.owner_github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-text hover:underline"
                >
                  GitHub
                </a>
              </>
            )}
          </p>

          {data.description && (
            <p className="mt-5 max-w-prose whitespace-pre-line text-muted">{data.description}</p>
          )}

          {data.github_url && (
            <p className="mt-6">
              <a
                href={data.github_url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary-text hover:underline"
              >
                View the code on GitHub
              </a>
            </p>
          )}
        </article>
      )}
    </Section>
  )
}
