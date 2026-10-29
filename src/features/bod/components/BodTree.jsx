import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import BodCard from './BodCard'
import { BOD_ROWS, bodRank } from '../positions'
import { useBodMembers } from '../hooks'

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-y-10 lg:gap-y-12">
      <div className="aspect-square w-[min(18rem,60vw)] animate-pulse rounded-2xl bg-surface-alt" />
      <div className="flex flex-wrap items-start justify-center gap-6 lg:gap-8">
        <div className="aspect-[4/5] w-[min(15rem,42vw)] animate-pulse rounded-2xl bg-surface-alt" />
        <div className="aspect-[4/5] w-[min(15rem,42vw)] animate-pulse rounded-2xl bg-surface-alt" />
      </div>
    </div>
  )
}

/**
 * The board as a hierarchy: the president's larger card alone on top, then the
 * vice president beside the secretary, then the vice secretary beside the
 * treasurer, then anyone else in centred rows. `BOD_ROWS` in `positions.js` is
 * the order; members keep the order the API gave them inside a row.
 *
 * Each row is centred and hugs its cards, so a card sits directly under the one
 * above it. No lines are drawn between the levels.
 *
 * `filter` narrows the list (the Home page hides the committee heads here, so
 * they appear under their own heading instead).
 */
export default function BodTree({ filter }) {
  const { data, isPending, isError, refetch } = useBodMembers()

  if (isPending) return <Skeleton />
  if (isError)
    return <ErrorState message="We could not load the board right now." onRetry={refetch} />

  const members = (data ?? []).filter(filter ?? (() => true))
  if (!members.length)
    return (
      <EmptyState
        title="No board members yet"
        description="This year’s board has not been added yet."
      />
    )

  const rows = BOD_ROWS.map((row) => ({
    ...row,
    members: members.filter((member) => row.ranks.includes(bodRank(member.position))),
  })).filter((row) => row.members.length > 0)

  return (
    <div className="flex flex-col items-center gap-y-10 lg:gap-y-12">
      {rows.map((row) => (
        <ul key={row.ranks[0]} className="flex flex-wrap items-start justify-center gap-6 lg:gap-8">
          {row.members.map((member) => (
            <li key={member.id}>
              <BodCard member={member} featured={row.featured} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
