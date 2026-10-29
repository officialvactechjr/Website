import robot from '../../assets/hero/hero-robot.webp'

/**
 * The Home hero artwork, in one place on purpose.
 *
 * The file is 688x960 (portrait), so `width`/`height` must match it exactly: they
 * hold the box open before the image loads, and a stale ratio shifts the page as
 * the image lands. It is sized by its parent's height (`h-full w-auto`), which is
 * what keeps the hero, and the button under it, on one screen.
 *
 * Do not go back to the designer's original `heroRobot.svg` — it was 8.3 MB, two
 * 2698px base64 rasters and an feColorMatrix mask the browser re-rasterises every
 * frame. Bake it down to a flat image first.
 */
export default function HeroVisual({ className = '' }) {
  return (
    <img
      src={robot}
      alt="The club's robot mascot holding a glowing holographic control panel"
      width={688}
      height={960}
      className={`h-full w-auto max-w-full animate-float ${className}`}
    />
  )
}
