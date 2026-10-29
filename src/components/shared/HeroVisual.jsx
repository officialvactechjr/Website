import robot from '../../assets/hero/hero-robot.webp'

/**
 * The Home hero artwork, in one place on purpose.
 *
 * The file is 542x460, so it goes soft above about 540px of display width and on
 * retina screens. Keep `width`/`height` equal to its real pixel size: they hold
 * the box open before the image loads, and a stale ratio shifts the page as the
 * image lands.
 *
 * Do not go back to the designer's original `heroRobot.svg` — 8.3 MB, two 2698px
 * base64 rasters and an feColorMatrix mask the browser re-rasterises every frame.
 * Bake it down to a flat image first.
 */
export default function HeroVisual({ className = '' }) {
  return (
    <img
      src={robot}
      alt="The club's robot mascot holding a glowing holographic control panel"
      width={542}
      height={460}
      className={`h-auto w-full animate-float ${className}`}
    />
  )
}
