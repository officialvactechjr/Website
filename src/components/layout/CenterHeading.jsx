/** A centred section title in the club's soft blue, used on the Home page. */
export default function CenterHeading({ title, description }) {
  return (
    <div className="mb-[clamp(28px,4vw,48px)] text-center">
      <h2 className="text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.12] font-bold tracking-tight text-balance text-accent-soft">
        {title}
      </h2>
      {description && <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{description}</p>}
    </div>
  )
}
