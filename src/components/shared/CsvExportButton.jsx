import Papa from 'papaparse'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { csvCell } from '../../lib/utils'

/**
 * Downloads rows as CSV. Every cell goes through `csvCell`, so a value starting
 * with = + - or @ cannot run as a formula in Excel or Sheets.
 */
export default function CsvExportButton({
  rows,
  filename,
  disabled = false,
  label = 'Export CSV',
}) {
  function download() {
    if (!rows?.length) return

    const safe = rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [csvCell(key), csvCell(value)])),
    )

    // The BOM keeps Devanagari and accents readable when Excel opens the file.
    const csv = `\uFEFF${Papa.unparse(safe)}`
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Download started')
  }

  return (
    <Button variant="secondary" size="sm" onClick={download} disabled={disabled || !rows?.length}>
      {label}
    </Button>
  )
}
