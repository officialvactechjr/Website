import { Link } from 'react-router-dom'
import { CalendarDays, Megaphone, Palette, Rocket, Terminal, Users } from 'lucide-react'
import HorizontalMarquee from './HorizontalMarquee'

// The four committees first, then two general hooks, so a single pass carries
// the whole pitch. Every card is the same width.
const ITEMS = [
  {
    Icon: Terminal,
    title: 'Coding Committee',
    text: 'Turn ideas into innovation and build real-world tech projects.',
  },
  {
    Icon: Palette,
    title: 'Graphics Committee',
    text: 'Craft stunning visuals, UI/UX, and creative club branding.',
  },
  {
    Icon: Megaphone,
    title: 'PR Committee',
    text: "Connect, communicate, and amplify the club's voice and outreach.",
  },
  {
    Icon: CalendarDays,
    title: 'Event Management Committee',
    text: 'Plan and execute hackathons, workshops, and showcases that inspire.',
  },
  {
    Icon: Users,
    title: 'Join a Team',
    text: 'Collaborate across Coding, Graphics, PR, or Event Management committees.',
    to: '/join',
  },
  {
    Icon: Rocket,
    title: 'Showcase Your Work',
    text: 'Get your projects featured and grow your portfolio.',
  },
]

// One card: 280px on a phone, 340 at `sm`, 400 from `lg` — so the centres are
// that far apart too, since the track has no gap. 40px above and 44 below on a
// desktop give the band ~230px of height, which is the look it wants.
//
// shortcut: on a phone the band runs taller (~280px) than the 210-230 asked for,
// because the longest title and the longest one-line descriptions each wrap —
// which the brief allows. Shrink the type or drop a description's words to bring
// it down.
const CARD =
  'w-[min(280px,80vw)] shrink-0 px-4 pt-9 pb-10 text-center sm:w-[340px] sm:pt-10 sm:pb-11 lg:w-[400px]'

function Body({ Icon, title, text }) {
  return (
    <>
      <Icon aria-hidden="true" strokeWidth={1.5} className="mx-auto size-10 text-accent" />
      <h3 className="mt-3 text-[22px] leading-tight font-semibold text-balance text-text">
        {title}
      </h3>
      <p className="mt-2 min-h-[2.9em] text-[17px] leading-[1.45] text-muted">{text}</p>
    </>
  )
}

function Committee({ Icon, title, text, to }) {
  // "Join a Team" is the one card that goes somewhere; its own height clears the
  // 44px touch target.
  return (
    <li className={CARD}>
      {to ? (
        <Link to={to} className="flex min-h-11 flex-col justify-center">
          <Body Icon={Icon} title={title} text={text} />
        </Link>
      ) : (
        <Body Icon={Icon} title={title} text={text} />
      )}
    </li>
  )
}

/** Full-bleed band under the hero, like the header and footer. */
export default function CommitteeMarquee() {
  return (
    <section aria-label="What the club is about" className="border-y border-border bg-surface">
      {/* The band has never carried visible text of its own; this is its heading
          for screen readers, so the strip is not an unlabelled block. */}
      <h2 className="sr-only">What the club is about</h2>
      <HorizontalMarquee
        items={ITEMS.map((item) => (
          <Committee key={item.title} {...item} />
        ))}
        ariaLabel="What the club is about"
      />
    </section>
  )
}
