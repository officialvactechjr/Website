import { useRef, useState } from 'react'
import Papa from 'papaparse'
import Button from '../../../components/ui/Button'
import { useBulkCreateMembers } from '../hooks'

const COLUMNS = ['full_name', 'email', 'class', 'section', 'github_url']

function clean(rows) {
  return rows.map((row) =>
    Object.fromEntries(COLUMNS.map((column) => [column, String(row[column] ?? '').trim()])),
  )
}

export default function BulkImport({ onDone, onCancel }) {
  const bulk = useBulkCreateMembers()
  const input = useRef(null)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  async function pick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const parsed = Papa.parse(await file.text(), { header: true, skipEmptyLines: true })
    const cleaned = clean(parsed.data)

    if (cleaned.length === 0) {
      setError('That file has no rows.')
      return
    }
    const bad = cleaned.find((row) => row.full_name.length < 2 || !row.email.includes('@'))
    if (bad) {
      setError('Every row needs a full name and an email address.')
      return
    }

    setRows(cleaned)
    setError(null)
  }

  function send() {
    bulk.mutate(rows, { onSuccess: (data) => onDone(data) })
  }

  return (
    <div className="flex flex-col gap-4">
      <input ref={input} type="file" accept=".csv,text/csv" onChange={pick} className="sr-only" />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()}>
          Choose CSV file
        </Button>
        <span className="text-sm text-muted">
          {rows ? `${rows.length} row${rows.length === 1 ? '' : 's'} ready` : 'No file chosen yet'}
        </span>
      </div>

      <p className="text-xs text-muted">
        Columns: full_name, email, class, section, github_url. At most 200 rows per file. Every
        account is created as a member with a temporary password.
      </p>

      {error && (
        <p role="alert" className="rounded-sm border border-danger px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={bulk.isPending}>
          Cancel
        </Button>
        <Button type="button" onClick={send} loading={bulk.isPending} disabled={!rows}>
          Import accounts
        </Button>
      </div>
    </div>
  )
}
