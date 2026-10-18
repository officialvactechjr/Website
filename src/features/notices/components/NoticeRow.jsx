import { Link } from 'react-router-dom'
import Badge from '../../../components/ui/Badge'
import { formatDate } from '../../../lib/utils'

export default function NoticeRow({ notice }) {
  return (
    <Link
      to={`/notices/${notice.id}`}
      className="group grid gap-x-[22px] gap-y-1.5 border-t border-border py-5 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-baseline"
    >
      <span className="font-mono text-[13px] text-muted">{formatDate(notice.published_at)}</span>
      <span className="text-[17px] font-medium transition-colors group-hover:text-primary-text">
        {notice.title}
      </span>
      {notice.is_pinned ? <Badge variant="gold">Pinned</Badge> : null}
    </Link>
  )
}
