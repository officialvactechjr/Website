import Button from '../ui/Button'
import Modal from '../ui/Modal'

/**
 * Confirmation dialog, size `sm`. By default it names the thing being deleted;
 * pass `body` for any other question (the log-out dialog does). Cancel is
 * focused by default, which is the safe side for a destructive confirm.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this?',
  itemName,
  body,
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {body ? (
        <p className="text-sm text-muted">{body}</p>
      ) : (
        <p className="text-sm text-muted">
          This will permanently remove <span className="font-semibold text-text">{itemName}</span>.
          This cannot be undone.
        </p>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading} data-autofocus>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
