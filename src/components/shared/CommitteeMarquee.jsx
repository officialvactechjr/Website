import { CalendarDays, Megaphone, Palette, Rocket, Terminal, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

// The four committees first, then two general hooks, so a single pass carries
// the whole pitch. Every item is the same width, and the track renders the list
// twice — that is what makes the -50% shift in `vac-marquee` land on the second
// copy with no seam.
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
  },
  {
    Icon: Rocket,
    title: 'Showcase Your Work',
    text: 'Get your projects featured and grow your portfolio.',
  },
]

function Item({ Icon, title, text, duplicate }) {
  return (
    <li
      aria-hidden={duplicate || undefined}
      className={cn(
        'flex w-[min(78vw,320px)] shrink-0 flex-col items-center px-4 text-center',
        // With reduced motion the track stops and wraps, so the second copy
        // would just read as a duplicate.
        duplicate && 'motion-reduce:hidden',
      )}
    >
      <Icon aria-hidden="true" strokeWidth={1.5} className="size-8 text-accent" />
      <h3 className="mt-3 text-[17px] font-semibold text-text">{title}</h3>
      <p className="mt-1 min-h-10 text-[13.5px] leading-snug text-muted">{text}</p>
    </li>
  )
}

/** Full-bleed band under the hero, like the header and footer. */
export default function CommitteeMarquee() {
  return (
    <section
      aria-label="What the club is about"
      className="group overflow-hidden border-y border-border bg-bg"
    >
      {/* The fade at each edge is a mask, so it needs no extra elements and
          follows the band's background. */}
      <div className="[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]">
        <ul
          className={cn(
            'flex w-max animate-marquee items-center py-[clamp(20px,3.5vw,32px)]',
            'group-hover:[animation-play-state:paused]',
            'motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8',
          )}
        >
          {ITEMS.map((item) => (
            <Item key={item.title} {...item} />
          ))}
          {ITEMS.map((item) => (
            <Item key={`duplicate-${item.title}`} {...item} duplicate />
          ))}
        </ul>
      </div>
    </section>
  )
}
