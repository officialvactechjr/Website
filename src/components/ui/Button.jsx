import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition duration-150 ease-assemble active:scale-[.98] disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary:
    'border-primary bg-primary text-primary-ink hover:border-primary-hover hover:bg-primary-hover',
  secondary: 'border-border-strong text-text hover:border-primary hover:text-primary',
  // The information-tone action: cyan hairline, no fill until hover.
  outline: 'border-accent/30 text-accent hover:border-accent/60 hover:bg-accent/10',
  ghost: 'border-transparent text-muted hover:text-text',
  danger: 'border-danger bg-danger text-white hover:opacity-90',
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
