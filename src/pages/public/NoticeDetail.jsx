import { Link, useParams } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import ErrorState from '../../components/ui/ErrorState'
import Section from '../../components/layout/Section'
import Spinner from '../../components/ui/Spinner'
import { useNotice } from '../../features/notices/hooks'
import { formatDate } from '../../lib/utils'

export default function NoticeDetail() {
  const { id } = useParams()
  const { data, isPending, isError, refetch } = useNotice(id)

  return (
    <Section tight>
      <Link to="/notices" className="text-sm font-semibold text-primary-text hover:underline">
        All notices
      </Link>

      {isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="mt-6">
          <ErrorState message="We could not load this notice." onRetry={refetch} />
        </div>
      )}

      {data && (
        <article className="mt-6 max-w-prose">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[13px] text-muted">
              {formatDate(data.published_at)}
            </span>
            {data.is_pinned && <Badge variant="gold">Pinned</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-balance sm:text-3xl">{data.title}</h1>
          <p className="mt-5 whitespace-pre-line text-muted">{data.body}</p>
        </article>
      )}
    </Section>
  )
}
