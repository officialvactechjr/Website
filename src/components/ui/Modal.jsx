import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

// Tailwind's Preflight sets `margin: 0` on everything, which throws away the
// browser's automatic centring for `dialog:modal` and parks it in the top-left
// corner. `m-auto` puts it back; the rest is height and scrolling.
//
// Widths by content. The dialog is a flex column, so the header stays put and
// only the body scrolls.
const SIZES = {
  sm: 'w-[min(26rem,calc(100vw-2rem))]',
  md: 'w-[min(35rem,calc(100vw-2rem))]',
  lg: 'w-[min(47.5rem,calc(100vw-2rem))]',
  xl: 'w-[min(60rem,calc(100vw-2rem))]',
}

// A native <dialog> gives us Esc-to-close, focus trapping and the inert page
// behind it for free.
export default function Modal({ open, onClose, title, size = 'md', children, className }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal focuses the first focusable child (here, the close button).
      // A child marked `[data-autofocus]` wins — confirm dialogs want Cancel.
      dialog.querySelector('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Clicking the backdrop closes. The dialog element itself covers the whole
  // viewport, so a click that lands on the dialog box rather than its content
  // is a backdrop click.
  function onPointerDown(event) {
    if (event.target === ref.current) onClose?.()
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onPointerDown={onPointerDown}
      className={cn(
        // `m-auto` centres it; `max-h` keeps it on screen and the body scrolls.
        'animate-pop m-auto max-h-[90vh] flex-col overflow-hidden rounded-md border border-border bg-surface p-0 text-text backdrop:animate-fade backdrop:bg-black/60',
        SIZES[size] ?? SIZES.md,
        open && 'flex',
        className,
      )}
    >
      <div className="flex flex-none items-center justify-between gap-4 border-b border-border px-5 py-3">
        <h2 className="truncate font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:text-text"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      {/* Children mount only while open, so a form inside gets fresh defaults
          every time it is opened instead of keeping the last edit's values. */}
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-5">{open && children}</div>
    </dialog>
  )
}
