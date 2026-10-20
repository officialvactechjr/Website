import Button from '../ui/Button'
import Modal from '../ui/Modal'

/** Delete confirmation. Always names the thing being deleted. */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this?',
  itemName,
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted">
        This will permanently remove <span className="font-semibold text-text">{itemName}</span>.
        This cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
