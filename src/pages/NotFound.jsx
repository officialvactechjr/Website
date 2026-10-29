import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import robot from '../assets/hero/hero-robot.webp'

export default function NotFound() {
  return (
    <section className="hero-glow hero-glow-full relative grid min-h-[calc(100svh-76px)] place-items-center overflow-hidden px-[clamp(16px,4vw,40px)] py-[clamp(32px,6vh,64px)] text-center">
      <div>
        {/* The big number sits behind the mascot, like the club's illustration. */}
        <div className="relative mx-auto flex w-fit items-center justify-center">
          <p
            aria-hidden="true"
            className="leading-none font-extrabold tracking-tight text-transparent [-webkit-text-stroke:2px_color-mix(in_srgb,var(--muted)_35%,transparent)] text-[clamp(7rem,26vw,17rem)]"
          >
            404
          </p>
          <img
            src={robot}
            alt=""
            aria-hidden="true"
            width={688}
            height={960}
            className="absolute inset-0 m-auto h-[86%] w-auto"
          />
        </div>

        <h1 className="mt-[clamp(12px,2.5vh,28px)] text-[clamp(1.3rem,3vw,1.8rem)] font-bold tracking-tight">
          uh-oh! Nothing here…
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The page you were looking for does not exist, or it has moved.
        </p>

        <Button as={Link} to="/home" variant="brand" shape="pill" size="lg" className="mt-7">
          Go back home
        </Button>
      </div>
    </section>
  )
}
