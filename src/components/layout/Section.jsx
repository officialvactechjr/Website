/** The shared public page container: max width, side padding, section rhythm. */
export default function Section({ id, children, tight = false, className = '' }) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] ${
        tight ? 'py-[clamp(40px,6vw,72px)]' : 'py-[clamp(56px,8vw,100px)]'
      } ${className}`}
    >
      {children}
    </section>
  )
}
