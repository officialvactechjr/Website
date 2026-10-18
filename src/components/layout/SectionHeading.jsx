/** The section header used on the public pages (see the landing page's `sec-head`). */
export default function SectionHeading({ title, description, action, className = '' }) {
  return (
    <div
      className={`mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-5 ${className}`}
    >
      <div>
        <h2 className="text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.12] font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description && <p className="mt-2.5 max-w-[30em] text-[15px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
