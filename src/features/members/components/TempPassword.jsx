import { useState } from 'react'
import { toast } from 'sonner'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import CsvExportButton from '../../../components/shared/CsvExportButton'

/**
 * The one time a temporary password is visible. It is never stored, so this
 * dialog cannot be reopened — reset the password again instead.
 */
export default function TempPassword({ result, onClose }) {
  const [copied, setCopied] = useState(false)

  const rows = (result?.results ?? []).filter((row) => row.temp_password)
  const single = result?.temp_password

  const text = single
    ? `Email: ${result.email}\nTemporary password: ${result.temp_password}`
    : rows.map((row) => `${row.email},${row.temp_password}`).join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied')
    } catch {
      toast.error('Copying did not work. Select the text and copy it yourself.')
    }
  }

  return (
    <Modal open onClose={onClose} title="Hand this over in person">
      <p className="text-sm text-muted">
        This is the only time these passwords are shown. They are not stored anywhere, and the
        member chooses their own password on first login.
      </p>

      <pre className="mt-4 max-h-64 overflow-auto rounded-sm border border-border bg-surface-alt p-4 font-mono text-xs whitespace-pre-wrap">
        {text}
      </pre>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <CsvExportButton
          rows={rows.length > 0 ? rows : [{ email: result?.email, temp_password: single }]}
          filename="temporary-passwords.csv"
          label="Download CSV"
        />
        <Button variant="secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy all'}
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}
