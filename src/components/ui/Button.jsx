import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors'

const VARIANTS = {
  primary: 'bg-primary text-primary-ink hover:bg-primary-hover',
  secondary: 'border border-border-strong text-text hover:border-primary hover:text-primary',
  ghost: 'text-muted hover:text-text',
  danger: 'bg-danger text-white hover:opacity-90',
}

const SIZES = {
  sm: 'h-10 px-[18px] text-sm',
  md: 'h-[46px] px-6 text-[15px]',
}

// `as` lets a router <Link> take a button look: <Button as={Link} to="/join" />
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  type = 'button',
  disabled,
  ...props
}) {
  const isButton = Component === 'button'

  return (
    <Component
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...(isButton ? { type, disabled: disabled || loading } : null)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  )
}
