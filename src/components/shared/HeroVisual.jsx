import robot from '../../assets/hero/robot-placeholder.svg'

/**
 * The Home hero artwork, in one place on purpose.
 * To use the real robot, replace `src/assets/hero/robot-placeholder.svg` — this
 * component and the Home layout stay exactly as they are.
 */
export default function HeroVisual({ className = '' }) {
  return (
    <img
      src={robot}
      alt="The club's robot mascot, waving"
      width={560}
      height={420}
      className={`h-auto w-full ${className}`}
    />
  )
}
