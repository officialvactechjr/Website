import { Link } from 'react-router-dom'
import {
  Code,
  Handshake,
  MessageSquare,
  Palette,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Section from '../../components/layout/Section'
import CenterHeading from '../../components/layout/CenterHeading'
import HeroVisual from '../../components/shared/HeroVisual'
import MascotScene from '../../components/shared/MascotScene'
import CommitteeMarquee from '../../components/shared/CommitteeMarquee'
import BodTree from '../../features/bod/components/BodTree'
import CommitteeHeads from '../../features/bod/components/CommitteeHeads'
import { isCommitteeHead } from '../../features/bod/positions'
import { useMembers } from '../../features/members/hooks'
import { useProjects } from '../../features/projects/hooks'
import { useEvents } from '../../features/events/hooks'

// The club's own words about itself. Fixed copy, not data.
const STORY = [
  {
    icon: Users,
    title: 'About VAC Tech Club',
    body: [
      'VAC Tech Club (+2 Wing) is a tech-driven initiative of Vishwa Adarsha College, created to spark innovation, collaboration, and creative problem-solving.',
      'Through workshops, hackathons, and mentorship, we help students turn curiosity into capability — empowering them to learn, build, and lead.',
    ],
  },
  {
    icon: Target,
    title: 'Mission & Vision',
    body: [
      'Our vision is to make Vishwa Adarsha +2 College a leading center for youth innovation.',
    ],
    points: [
      { icon: Code, text: 'Empower students with skills in tech, creativity, and teamwork.' },
      { icon: Handshake, text: 'Build a strong, connected network of tech communities.' },
      { icon: Trophy, text: 'Establish a Core Team to represent us in hackathons and events.' },
    ],
  },
  {
    icon: Users,
    title: 'Our Committees',
    body: ['Our club thrives through four active committees driving innovation.'],
    points: [
      { icon: Code, text: 'Coding: Turns ideas into digital solutions.' },
      { icon: Palette, text: 'Graphics Design: Brings imagination to life with visuals.' },
      { icon: Sparkles, text: 'ECA: Energizes campus with creative events.' },
      { icon: MessageSquare, text: 'PR: Drives outreach and partnerships.' },
    ],
  },
]

export default function Home() {
  // Real counts, straight from the public data.
  const members = useMembers()
  const projects = useProjects()
  const events = useEvents()

  const stats = [
    { icon: Users, value: members.data?.length, label: 'Active Members', plus: true },
    { icon: Code, value: 4, label: 'Committees', plus: false },
    { icon: Trophy, value: projects.data?.length, label: 'Projects Completed', plus: true },
    { icon: Rocket, value: events.data?.length, label: 'Events Hosted', plus: true },
  ]

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-[clamp(16px,4vw,40px)] py-[clamp(40px,7vw,88px)] lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="text-[clamp(2rem,4.4vw,3.1rem)] leading-[1.08] font-bold tracking-tight text-balance text-accent-soft">
              Empowering Students to Innovate, Create &amp; Lead
            </h1>
            <p className="mt-5 max-w-xl text-[15px] text-muted">
              Welcome to VAC Tech Jr Club— a community where curiosity meets innovation. We build
              real-world solutions, sharpen technical skills, and grow together as future tech
              leaders.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <Button as={Link} to="/join">
                Join the Club
              </Button>
              <Button as={Link} to="/projects" variant="outline">
                Explore Projects
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MascotScene className="aspect-square h-[min(46vh,360px)]">
              <div className="h-[76%]">
                <HeroVisual />
              </div>
            </MascotScene>
          </div>
        </div>
      </section>

      <CommitteeMarquee />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 gap-y-8 px-[clamp(16px,4vw,40px)] py-[clamp(28px,4vw,48px)] lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label, plus }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="size-6 text-accent-soft" aria-hidden="true" />
              <p className="mt-2.5 text-2xl font-bold">
                {value ?? 0}
                {plus && (value ?? 0) > 0 ? '+' : ''}
              </p>
              <p className="mt-0.5 text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Section id="about" className="scroll-mt-[96px] border-b border-border">
        <CenterHeading
          title="Our Story"
          description="Welcome to VAC Tech Club (+2 wing), the official technology community of Vishwa Adarsha College – where ideas evolve into innovation and every student becomes a creator. We are a passionate group of +2 students exploring the limitless world of technology, design, and innovation, united by one goal — to build the future, together."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {STORY.map(({ icon: Icon, title, body, points }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-[clamp(20px,3vw,32px)] text-center"
            >
              <span className="mx-auto grid size-11 place-items-center rounded-full border border-border-strong text-accent-soft">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              {body.map((line) => (
                <p key={line} className="mt-3 text-sm leading-relaxed text-muted">
                  {line}
                </p>
              ))}
              {points && (
                <ul className="mt-4 space-y-2.5 text-left">
                  {points.map((point) => {
                    const PointIcon = point.icon
                    return (
                      <li key={point.text} className="flex items-start gap-2.5 text-sm text-muted">
                        <PointIcon
                          className="mt-0.5 size-4 shrink-0 text-accent-soft"
                          aria-hidden="true"
                        />
                        <span>{point.text}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-b border-border">
        <CenterHeading
          title="Board of Directors"
          description="Meet the brilliant minds leading our technical, creative, and operational divisions."
        />
        {/* Committee heads have their own section below. */}
        <BodTree filter={(member) => !isCommitteeHead(member.position)} />
      </Section>

      <CommitteeHeads />
    </>
  )
}
