import { useState } from 'react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import CsvExportButton from '../../../components/shared/CsvExportButton'

/**
 * The one time a temporary password is visible. It is never stored, so this
 * dialog cannot be reopened — reset the password again instead.
 *
 * A single result shows one line to copy; a bulk result also offers printable
 * credential slips (one per person) for handing over in person.
 */
export default function TempPassword({ result, onClose }) {
  const [copied, setCopied] = useState(false)

  const rows = (result?.results ?? []).filter((row) => row.temp_password)
  const single = result?.temp_password

  const list = single
    ? [{ full_name: result.full_name, email: result.email, temp_password: single }]
    : rows

  const loginUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/login`

  const text = list.map((row) => `${row.email},${row.temp_password}`).join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied')
    } catch {
      toast.error('Copying did not work. Select the text and copy it yourself.')
    }
  }

  function printSlips() {
    const slips = list
      .map(
        (row) => `
        <section class="slip">
          <h2>VAC-TECH Jr.</h2>
          <p class="name">${escapeHtml(row.full_name || '')}</p>
          <dl>
            <dt>Login email</dt><dd>${escapeHtml(row.email)}</dd>
            <dt>Temporary password</dt><dd class="pw">${escapeHtml(row.temp_password)}</dd>
            <dt>Log in at</dt><dd>${escapeHtml(loginUrl)}</dd>
          </dl>
          <p class="note">Change this password the first time you log in.</p>
        </section>`,
      )
      .join('')

    const win = window.open('', '_blank', 'width=640,height=800')
    if (!win) {
      toast.error('Your browser blocked the print window. Allow pop-ups and try again.')
      return
    }
    win.document.write(`<!doctype html><html><head><title>Credential slips</title><style>
      body { font-family: system-ui, sans-serif; margin: 0; }
      .slip { border: 1px dashed #888; padding: 24px; margin: 16px; page-break-after: always; }
      .slip h2 { margin: 0 0 12px; font-size: 16px; }
      .name { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
      dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; }
      dt { color: #555; }
      dd { margin: 0; }
      .pw { font-family: monospace; font-size: 16px; }
      .note { margin-top: 16px; font-size: 13px; color: #444; }
    </style></head><body>${slips}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <Modal open onClose={onClose} title="Hand this over in person" size="lg">
      <p className="text-sm text-muted">
        This is the only time these passwords are shown. They are not stored anywhere, and each
        person chooses their own password on first login. Hand the slips over personally and delete
        any file you saved afterwards.
      </p>

      <pre className="scroll-thin mt-4 max-h-64 overflow-auto rounded-sm border border-border bg-surface-alt p-4 font-mono text-xs whitespace-pre-wrap">
        {list
          .map(
            (row) =>
              `${row.full_name ? `${row.full_name}\n` : ''}${row.email}\n${row.temp_password}`,
          )
          .join('\n\n')}
      </pre>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <CsvExportButton
          rows={list.map((row) => ({
            name: row.full_name || '',
            email: row.email,
            temp_password: row.temp_password,
          }))}
          filename="temporary-passwords.csv"
          label="Download CSV"
        />
        <Button variant="secondary" onClick={printSlips}>
          Print credential slips
        </Button>
        <Button variant="secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy all'}
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}

/** Only ever prints text the admin already sees; escaping keeps the slip safe. */
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
  )
}
