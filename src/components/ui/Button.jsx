import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

// The radius lives in SHAPES, not here, so a caller can pick the pill without
// fighting this class on CSS order.
const BASE =
  'inline-flex items-center justify-center gap-2 border font-semibold transition duration-150 ease-assemble active:scale-[.98] disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary:
    'border-primary bg-primary text-primary-ink hover:border-primary-hover hover:bg-primary-hover',
  secondary: 'border-border-strong text-text hover:border-primary hover:text-primary',
  // The information-tone action: cyan hairline, no fill until hover.
  outline: 'border-accent/30 text-accent hover:border-accent/60 hover:bg-accent/10',
  // The landing hero's call to action (the club's mock): a filled blue.
  brand: 'border-brand bg-brand text-white hover:border-brand-hover hover:bg-brand-hover',
  ghost: 'border-transparent text-muted hover:text-text',
  danger: 'border-danger bg-danger text-white hover:opacity-90',
}

const SIZES = {
  sm: 'h-10 px-[18px] text-sm',
  md: 'h-[46px] px-6 text-[15px]',
  lg: 'h-[54px] px-7 text-base',
}

const SHAPES = {
  default: 'rounded-md',
  pill: 'rounded-full',
}

// `as` lets a router <Link> take a button look: <Button as={Link} to="/join" />
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  shape = 'default',
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
      className={cn(
        BASE,
        SHAPES[shape] ?? SHAPES.default,
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...(isButton ? { type, disabled: disabled || loading } : null)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  )
}
