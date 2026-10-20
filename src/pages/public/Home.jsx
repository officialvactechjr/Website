import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Section from '../../components/layout/Section'
import SectionHeading from '../../components/layout/SectionHeading'
import HeroVisual from '../../components/shared/HeroVisual'
import NoticeList from '../../features/notices/components/NoticeList'
import EventList from '../../features/events/components/EventList'
import ProjectList from '../../features/projects/components/ProjectList'
import LeaderboardList from '../../features/leaderboard/components/LeaderboardList'
import BodGrid from '../../features/bod/components/BodGrid'
import { useAuth } from '../../context/useAuth'

const WHAT_WE_DO = [
  {
    title: 'Workshops',
    text: 'Hands-on sessions run by senior members and invited teachers. You write code during the session and leave with something working.',
  },
  {
    title: 'Projects',
    text: 'Members build their own apps, sites and tools. Approved work goes on the projects page with the builder\u2019s name and GitHub link.',
  },
  {
    title: 'Events',
    text: 'Quizzes, coding contests and talks across the year. Registration opens on the event page for a set time, then closes.',
  },
]

// Every public page has to be reachable from Home as well as the footer.
// Projects, Top contributors and the board now have their own sections below,
// so this row only carries the rest.
const EXPLORE = [
  { to: '/gallery', label: 'Photo gallery' },
  { to: '/members', label: 'Member list' },
  { to: '/contact', label: 'Contact' },
]

const MORE =
  'border-b border-transparent pb-0.5 text-sm font-semibold text-primary-text transition-colors hover:border-primary'

export default function Home() {
  const { profile } = useAuth()

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1180px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,8vw,96px)]">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="rv font-mono text-xs tracking-[0.18em] text-muted uppercase"
              style={{ '--d': '0.05s' }}
            >
              VAC-Tech Jr.
            </p>
            <h1
              className="rv mt-4 text-[clamp(2.2rem,5.6vw,3.8rem)] leading-[1.05] font-semibold tracking-tight text-balance"
              style={{ '--d': '0.12s' }}
            >
              Students who build.
            </h1>
            <p className="rv mx-auto mt-5 max-w-[34em] text-muted" style={{ '--d': '0.2s' }}>
              The IT club of Vishwa Adarsha Academy&apos;s +2 section. We run workshops, hold events
              and put what our members make on show.
            </p>
          </div>

          <div
            className="rv mx-auto mt-[clamp(28px,5vw,56px)] w-full max-w-[520px]"
            style={{ '--d': '0.3s' }}
          >
            <HeroVisual />
          </div>

          <div
            className="rv mt-[clamp(24px,4vw,40px)] flex flex-wrap justify-center gap-3.5"
            style={{ '--d': '0.4s' }}
          >
            <Button as="a" href="#about" variant="secondary">
              View about
            </Button>
            {!profile && (
              <Button as={Link} to="/join">
                Join the club
              </Button>
            )}
          </div>
        </div>
      </section>

      <Section id="about" className="scroll-mt-[96px] border-b border-border">
        <SectionHeading title="What the club does" />
        <div className="grid gap-[clamp(24px,4vw,56px)] md:grid-cols-3">
          {WHAT_WE_DO.map((item) => (
            <div key={item.title} className="border-t border-border-strong pt-5">
              <h3 className="text-[19px] font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-[15px] text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          title="Notices"
          description="Official announcements from the club team."
          action={
            <Link to="/notices" className={MORE}>
              All notices
            </Link>
          }
        />
        <NoticeList limit={4} />
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          title="Events and workshops"
          action={
            <Link to="/events" className={MORE}>
              All events
            </Link>
          }
        />
        <EventList limit={3} />
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          title="Built by members"
          description="Every project is checked by the club team before it is shown here."
          action={
            <Link to="/projects" className={MORE}>
              All projects
            </Link>
          }
        />
        <div className="grid gap-[clamp(32px,6vw,80px)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <ProjectList limit={2} columns="grid-cols-1" />
          <div>
            <h3 className="text-[17px] font-semibold">Top contributors</h3>
            <p className="mt-0.5 mb-4 text-[13px] text-muted">Points are added by the club team.</p>
            <LeaderboardList limit={5} />
          </div>
        </div>
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          title="Board of directors"
          description="The students who run the club this year."
          action={
            <Link to="/bod" className={MORE}>
              Meet the board
            </Link>
          }
        />
        <BodGrid limit={4} />
      </Section>

      <Section className="border-b border-border">
        <SectionHeading
          title="More from the club"
          description="Everything the club publishes is open to everyone."
        />
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {EXPLORE.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="border-b border-border-strong pb-0.5 text-[15px] font-medium text-muted transition-colors hover:border-primary hover:text-text"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {!profile && (
        <Section>
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-sm border border-primary p-[clamp(24px,4.5vw,56px)]">
            <div>
              <h2 className="text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.12] font-semibold tracking-tight text-balance">
                Registration opens soon.
              </h2>
              <p className="mt-3.5 max-w-[34em] text-[15px] text-muted">
                When the club team opens the membership window, fill in the form. After approval you
                get an email and password to log in and upload your work.
              </p>
            </div>
            <Button as={Link} to="/join">
              Apply for membership
            </Button>
          </div>
        </Section>
      )}
    </>
  )
}
