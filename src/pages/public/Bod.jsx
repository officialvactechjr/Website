import Section from '../../components/layout/Section'
import BodTree from '../../features/bod/components/BodTree'

export default function Bod() {
  return (
    <Section>
      {/* A centred title in the club's soft blue, matching the board's tree of cards. */}
      <div className="mb-[clamp(32px,5vw,56px)] text-center">
        <h1 className="text-[clamp(2rem,4.6vw,3rem)] leading-tight font-bold tracking-tight text-balance text-accent-soft">
          Board of Directors
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">
          Meet the brilliant minds leading our technical, creative, and operational divisions.
        </p>
      </div>

      <BodTree />
    </Section>
  )
}
