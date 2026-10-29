import { useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import CsvExportButton from '../../../components/shared/CsvExportButton'
import { bulkCreateMembers } from '../api'
import { useAccounts } from '../hooks'
import { passwordProblem } from '../schema'

const COLUMNS = ['full_name', 'email', 'class', 'section', 'phone', 'github_url', 'password']
const MAX_ROWS = 200
const CHUNK = 25
// The function allows 10 calls a minute; a 200-row import is 8 chunks. Waiting a
// minute on a 429 is what stops a second import from losing the passwords already shown.
const RETRY_AFTER_MS = 61_000

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const TEMPLATE = [
  {
    full_name: 'Sample Student',
    email: 'sample@example.com',
    class: '11',
    section: 'A',
    phone: '',
    github_url: '',
    password: '',
  },
]

let nextId = 1

function clean(raw) {
  return Object.fromEntries(COLUMNS.map((column) => [column, String(raw[column] ?? '').trim()]))
}

/** Maps a pasted block of lines onto the columns, header or not. */
function parseText(text) {
  const trimmed = text.trim()
  if (!trimmed) return []
  const parsed = Papa.parse(trimmed, { header: true, skipEmptyLines: true })
  const fields = parsed.meta.fields ?? []
  if (fields.includes('email') || fields.includes('full_name')) return parsed.data.map(clean)

  const bare = Papa.parse(trimmed, { header: false, skipEmptyLines: true })
  return bare.data.map((values) =>
    clean(Object.fromEntries(COLUMNS.map((column, index) => [column, values[index]]))),
  )
}

/** Sends one chunk. On a rate limit it waits out the minute and tries once more. */
async function sendChunk(rows) {
  try {
    return await bulkCreateMembers(rows)
  } catch (error) {
    if (error?.code !== 'rate_limited') throw error
    await delay(RETRY_AFTER_MS)
    return bulkCreateMembers(rows)
  }
}

export default function BulkImport({ onDone, onCancel }) {
  const input = useRef(null)
  const accounts = useAccounts()
  const [rows, setRows] = useState([])
  const [paste, setPaste] = useState('')
  const [note, setNote] = useState(null)

  const existing = useMemo(
    () => new Set((accounts.data ?? []).map((account) => (account.email ?? '').toLowerCase())),
    [accounts.data],
  )

  // Each row's verdict, plus whether it repeats an email seen higher up the list.
  const withStatus = useMemo(() => {
    const seen = new Set()
    return rows.map((row) => {
      const email = row.email.toLowerCase()
      let status = 'Ready'
      let tone = 'success'

      if (row.full_name.length < 2) {
        status = 'Missing name'
        tone = 'danger'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        status = 'Invalid email'
        tone = 'danger'
      } else if (!row.class || !row.section) {
        status = 'Missing class or section'
        tone = 'danger'
      } else if (seen.has(email)) {
        status = 'Duplicate in file'
        tone = 'warning'
      } else if (existing.has(email)) {
        status = 'Account already exists'
        tone = 'warning'
      } else if (row.password) {
        const problem = passwordProblem(row.password, row.email, row.full_name)
        if (problem) {
          status = problem
          tone = 'danger'
        }
      }

      seen.add(email)
      return { ...row, status, tone, ok: status === 'Ready' && !row.skip }
    })
  }, [rows, existing])

  const ready = withStatus.filter((row) => row.ok)

  const bulk = useMutation({
    mutationFn: async (list) => {
      const results = []
      let lastError = null

      for (let index = 0; index < list.length; index += CHUNK) {
        const chunk = list.slice(index, index + CHUNK)
        const rows = chunk.map((row) => ({
          full_name: row.full_name,
          email: row.email,
          class: row.class,
          section: row.section,
          phone: row.phone,
          github_url: row.github_url,
          password: row.password,
        }))

        try {
          const data = await sendChunk(rows)
          results.push(...(data?.results ?? []))
        } catch (error) {
          // Keep going: the chunks that already succeeded have passwords we must
          // not throw away. This chunk's rows are reported as failed.
          lastError = error
          for (const row of chunk) {
            results.push({
              email: row.email,
              full_name: row.full_name,
              status: 'failed',
              error: error?.message ?? 'This row could not be sent.',
            })
          }
        }
      }

      const created = results.filter((row) => row.status === 'created').length
      // Nothing got through at all: let the toast explain, and show no empty dialog.
      if (created === 0) {
        throw lastError ?? new Error('No accounts were created. Check the rows and try again.')
      }

      return { created, total: list.length, results }
    },
    onError: (error) =>
      toast.error(error?.message ?? 'The import could not be sent. Please try again.'),
  })

  function add(parsed) {
    const merged = [...rows]
    for (const row of parsed) {
      if (merged.length >= MAX_ROWS) break
      merged.push({ id: nextId++, skip: false, ...row })
    }
    setRows(merged)
    setNote(
      merged.length >= MAX_ROWS ? `Stopped at ${MAX_ROWS} rows — the limit for one import.` : null,
    )
  }

  async function pick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    add(parseText(await file.text()))
  }

  function update(id, column, value) {
    setRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, [column]: value } : row)),
    )
  }

  function toggleSkip(id) {
    setRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, skip: !row.skip } : row)),
    )
  }

  function send() {
    bulk.mutate(ready, { onSuccess: (data) => onDone(data) })
  }

  return (
    <div className="flex flex-col gap-5">
      <input ref={input} type="file" accept=".csv,text/csv" onChange={pick} className="sr-only" />

      <p className="max-w-prose text-sm text-muted">
        Download the template or paste rows, check the preview, then confirm. Each member gets their
        own temporary password — never one shared password. At most {MAX_ROWS} rows per import.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <CsvExportButton
          rows={TEMPLATE}
          filename="members-template.csv"
          label="Download template"
        />
        <Button type="button" variant="secondary" onClick={() => input.current?.click()}>
          Choose CSV file
        </Button>
        <span className="text-sm text-muted">
          {rows.length} row{rows.length === 1 ? '' : 's'} · {ready.length} ready
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bulk-paste" className="text-sm font-medium text-text">
          Or paste rows
        </label>
        <textarea
          id="bulk-paste"
          rows={4}
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          placeholder="full_name,email,class,section,phone,github_url,password"
          className="rounded-sm border border-border bg-surface px-3 py-2 font-mono text-xs text-text focus:border-primary"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!paste.trim()}
            onClick={() => {
              add(parseText(paste))
              setPaste('')
            }}
          >
            Add pasted rows
          </Button>
        </div>
      </div>

      {note && (
        <p role="alert" className="rounded-sm border border-warning px-3 py-2 text-sm text-warning">
          {note}
        </p>
      )}

      {withStatus.length > 0 && (
        <div className="overflow-x-auto rounded-sm border border-border bg-surface">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-3 py-2">Skip</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {withStatus.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={row.skip}
                      aria-label={`Skip ${row.email || row.id}`}
                      onChange={() => toggleSkip(row.id)}
                    />
                  </td>
                  {['full_name', 'email', 'class', 'section'].map((column) => (
                    <td key={column} className="px-1 py-1.5">
                      <input
                        aria-label={column}
                        value={row[column]}
                        onChange={(event) => update(row.id, column, event.target.value)}
                        className="h-9 w-full min-w-24 rounded-sm border border-border bg-surface px-2 text-sm text-text focus:border-primary"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <Badge variant={row.skip ? 'neutral' : row.tone}>
                      {row.skip ? 'Skipped' : row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={bulk.isPending}>
          Cancel
        </Button>
        <Button type="button" onClick={send} loading={bulk.isPending} disabled={ready.length === 0}>
          Create {ready.length} account{ready.length === 1 ? '' : 's'}
        </Button>
      </div>
    </div>
  )
}
