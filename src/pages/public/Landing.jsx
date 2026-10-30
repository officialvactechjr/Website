import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import HeroVisual from '../../components/shared/HeroVisual'
import MascotScene from '../../components/shared/MascotScene'
import CommitteeMarquee from '../../components/shared/CommitteeMarquee'

const TAGLINE =
  "The IT club of Vishwa Adarsha Academy's +2 section — we build real projects, learn new skills and host our own events."

/**
 * The public landing. The first screen is the hero alone — PublicLayout renders
 * the header above it, so the hero is exactly `100dvh` minus the header height
 * and nothing below is visible on load. Scrolling then reveals the committee
 * band and the footer, in that order.
 *
 * Every hero size is capped in `vh` as well as `vw` (see `--head` in index.css),
 * so a short window shrinks the art instead of clipping it.
 */
export default function Landing() {
  return (
    <>
      <section className="hero-glow hero-glow-full relative flex min-h-[calc(100dvh-77px)] flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center px-[clamp(16px,4vw,40px)] py-[clamp(10px,2.2vh,30px)] text-center">
          {/* The heading is for screen readers and search engines; the big lines
              below are the same words, styled, so they are not read twice. */}
          <h1 className="sr-only">
            Introducing VAC Tech Jr — the IT club of Vishwa Adarsha Academy
          </h1>

          {/* Introducing / the robot / VAC Tech Jr, stacked so the robot stands
              between the two lines and both overlap it. The overlaps are fractions
              of the headline size, so the proportions hold at any window shape. */}
          <div className="relative flex w-full flex-col items-center">
            <p
              aria-hidden="true"
              className="relative z-0 text-[length:var(--head)] leading-none font-bold tracking-tight text-transparent [-webkit-text-stroke:2px_var(--violet)]"
            >
              Introducing
            </p>

            <MascotScene
              glow={false}
              animate
              spread="min(1600px, 92vw, calc((100svh - 76px) * 1.42))"
              className="relative z-10 mt-[calc(var(--head)*-0.7)] aspect-square h-[min(48vh,58vw,480px)]"
            >
              <div className="h-[86%]">
                <HeroVisual />
              </div>
            </MascotScene>

            <p
              aria-hidden="true"
              className="relative z-20 mt-[calc(var(--head)*-1.34)] text-[length:var(--head)] leading-none font-bold tracking-tight text-primary [text-shadow:0_3px_0_color-mix(in_srgb,var(--primary)_55%,#000),0_14px_34px_rgb(0_0_0/0.5)]"
            >
              VAC Tech Jr
            </p>
          </div>

          <p className="mt-[clamp(10px,1.8vh,22px)] max-w-[40rem] text-sm leading-relaxed text-muted">
            {TAGLINE}
          </p>

          <div className="mt-[clamp(12px,2.2vh,28px)] flex flex-wrap justify-center gap-4">
            <Button as={Link} to="/home" variant="brand" shape="pill" size="lg">
              View
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
            <Button as={Link} to="/login" variant="secondary" shape="pill" size="lg">
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Below the fold: the auto-scrolling committee band, then the footer from
          PublicLayout. This band lives on the landing only. */}
      <CommitteeMarquee />
    </>
  )
}
