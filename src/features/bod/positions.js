/** The position names that decide where a board member is shown. */

/** The president (never a vice president): the top card of the board tree. */
export function isPresident(position) {
  return /president/i.test(position ?? '') && !/vice/i.test(position ?? '')
}

/** A committee head, e.g. "ECA Head" — they are listed under Head of Committees. */
export function isCommitteeHead(position) {
  return /head/i.test(position ?? '')
}

// The club types these by hand in the admin form, so "Vice - President",
// "Vice President" and "Vice-President" all have to count.
const isVicePresident = (position) => /vice\s*-?\s*president/i.test(position ?? '')
const isViceSecretary = (position) => /vice\s*-?\s*secretary/i.test(position ?? '')
// A secretary who is not a vice or a joint one.
const isSecretary = (position) =>
  /secretary/i.test(position ?? '') && !/vice|joint|assist/i.test(position ?? '')
const isTreasurer = (position) => /treasurer/i.test(position ?? '')

/**
 * The rank a member holds on the board tree. The club types positions by hand,
 * so every helper matches loosely: "Vice - President", "Vice President" and
 * "Vice-President" all count as the same rank.
 */
export function bodRank(position) {
  if (isPresident(position)) return 'president'
  if (isVicePresident(position)) return 'vice-president'
  if (isViceSecretary(position)) return 'vice-secretary'
  if (isSecretary(position)) return 'secretary'
  if (isTreasurer(position)) return 'treasurer'
  return 'other'
}

/**
 * The board's hierarchy, one entry per row, top first: the president on their
 * own, the two pairs under them, then anyone else the club adds. Every rank
 * listed for a row sits in it side by side.
 */
export const BOD_ROWS = [
  { ranks: ['president'], featured: true },
  { ranks: ['vice-president', 'secretary'] },
  { ranks: ['vice-secretary', 'treasurer'] },
  { ranks: ['other'] },
]
