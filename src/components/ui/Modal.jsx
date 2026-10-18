import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

// A native <dialog> gives us Esc-to-close and focus trapping for free.
export default function Modal({ open, onClose, title, children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        'w-[min(32rem,calc(100vw-2rem))] rounded-sm border border-border bg-surface p-0 text-text backdrop:bg-black/60',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <h2 className="font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-muted transition-colors hover:text-text"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
