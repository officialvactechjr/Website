import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from './Button'
import EmptyState from './EmptyState'
import Input from './Input'
import { cn } from '../../lib/utils'

const PAGE_SIZE = 10

/**
 * The one table every admin page uses.
 *
 * `columns`: [{ key, label, sortable?, sortValue?(row), render?(row) }]
 * `searchText`: (row) => string — pass it to get a search box.
 * Rows must have an `id`.
 */
export default function DataTable({
  columns,
  rows,
  searchText,
  searchPlaceholder = 'Search',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  toolbar,
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [direction, setDirection] = useState('asc')
  const [page, setPage] = useState(1)

  const needle = query.trim().toLowerCase()
  const filtered =
    !searchText || !needle
      ? rows
      : rows.filter((row) => searchText(row).toLowerCase().includes(needle))

  // No memo here on purpose: every page builds `columns` inline, so the
  // dependency would be a new array each render and the cache would never hit.
  let sorted = filtered
  if (sortKey) {
    const column = columns.find((item) => item.key === sortKey)
    const valueOf = column?.sortValue ?? ((row) => row[sortKey])

    sorted = [...filtered].sort((a, b) => {
      const left = valueOf(a)
      const right = valueOf(b)
      if (left == null) return 1
      if (right == null) return -1

      const result =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right))
      return direction === 'asc' ? result : -result
    })
  }

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  function toggleSort(key) {
    if (sortKey === key) setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setDirection('asc')
    }
    setPage(1)
  }

  function search(value) {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="rounded-sm border border-border bg-surface">
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          {searchText ? (
            <div className="w-full sm:max-w-xs">
              <Input
                name="admin-search"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => search(event.target.value)}
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={query ? 'No matches' : emptyTitle}
            description={query ? 'Try a different search.' : emptyDescription}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="sticky top-0 bg-surface px-4 py-3 text-left font-medium whitespace-nowrap text-muted"
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="flex items-center gap-1 transition-colors hover:text-text"
                      >
                        {column.label}
                        {sortKey === column.key &&
                          (direction === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="size-3.5" aria-hidden="true" />
                          ))}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted">
          <span>
            Page {current} of {pageCount} · {sorted.length} row{sorted.length === 1 ? '' : 's'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
