import { useCallback, useEffect, useRef, useState } from 'react'
import './IntroAnimation.css'

// A faithful port of the animation in `VAC-TECH Jr.html`: same 27 pieces, same
// sequence, timings and easings. Do not "tidy" these numbers.
const EASE = 'cubic-bezier(.16,.84,.24,1)'
const FLY_EASE = 'cubic-bezier(.65,0,.2,1)'
const FLY_MS = 720
const RING_MS = 620
const RING_PAUSE_MS = 240
const REVEAL_AT_MS = 260
const SETTLE_MS = 1500
const LOGO_READY_MS = 2000
const SAFETY_MS = 8000

// Fixed entry delays for the named artwork pieces. The wordmark letters (L0…L10)
// are staggered instead, at 220ms + 38ms each.
const ART_DELAY = {
  pageL: 80,
  pageR: 80,
  edgeL: 160,
  edgeR: 160,
  wavesL: 240,
  wavesR: 240,
  swooshL: 300,
  swooshR: 300,
  goldbase: 340,
  pencil: 420,
  tickL: 480,
  tickR: 480,
  circGoldL: 120,
  circGoldR: 120,
  circCyanL: 200,
  circCyanR: 200,
}

const SESSION_KEY = 'vacIntroPlayed'

function markPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // Private mode: the intro simply runs again next time.
  }
}

/** Whatever happens, the page must end up visible. */
function showSite() {
  document.documentElement.classList.remove('intro-on', 'rv-hide', 'rv-show')
}

/** Deterministic random (seed 11) so every visitor sees the same assembly. */
function makeRandom(seed) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return value / 2147483647
  }
}

function entryFor(name, random, vw, vh) {
  const far = Math.max(vw, vh)
  const jitter = (amount) => (random() - 0.5) * amount

  if (name[0] === 'L') {
    return {
      dx: jitter(vw * 0.9),
      dy: vh * (0.45 + random() * 0.35),
      rot: jitter(80),
      sc: 0.4,
      dur: 760,
    }
  }
  if (/^circ.*L$/.test(name) || (/L$/.test(name) && /(edge|page|waves|swoosh)/.test(name))) {
    return {
      dx: -far * (0.55 + random() * 0.3),
      dy: jitter(vh * 0.5),
      rot: jitter(40),
      sc: 0.7,
      dur: 820,
    }
  }
  if (/R$/.test(name)) {
    return {
      dx: far * (0.55 + random() * 0.3),
      dy: jitter(vh * 0.5),
      rot: jitter(40),
      sc: 0.7,
      dur: 820,
    }
  }
  if (name === 'pencil') return { dx: 0, dy: -vh * 0.8, rot: 0, sc: 1, dur: 820 }
  if (name === 'goldbase') return { dx: 0, dy: vh * 0.7, rot: 0, sc: 0.8, dur: 820 }
  return { dx: jitter(vw * 0.3), dy: -vh * 0.7, rot: jitter(30), sc: 0.6, dur: 760 }
}

function Piece({ item, bandTop, bandHeight, width }) {
  return (
    <img
      className="intro-pc"
      data-n={item.n}
      src={item.src}
      alt=""
      decoding="async"
      style={{
        left: `${(item.x / width) * 100}%`,
        top: `${((item.y - bandTop) / bandHeight) * 100}%`,
        width: `${(item.w / width) * 100}%`,
        height: `${(item.h / bandHeight) * 100}%`,
      }}
    />
  )
}

export default function IntroAnimation() {
  // The pre-paint script in index.html decides this; if it did not run (or the
  // session already saw the intro) the component renders nothing at all.
  const [active, setActive] = useState(() =>
    document.documentElement.classList.contains('intro-on'),
  )
  const [parts, setParts] = useState(null)

  const bgRef = useRef(null)
  const artRef = useRef(null)
  const txtRef = useRef(null)
  const ringRef = useRef(null)

  const stop = useCallback((mark = false) => {
    if (mark) markPlayed()
    showSite()
    setActive(false)
  }, [])

  // Load the logo pieces (their own chunk) and measure the viewport.
  useEffect(() => {
    if (!active) return undefined
    let cancelled = false

    const giveUp = setTimeout(() => {
      if (!cancelled) stop()
    }, LOGO_READY_MS)

    import('./introLogo.json')
      .then(({ default: logo }) => {
        if (cancelled) return
        clearTimeout(giveUp)

        // Reduced motion is already handled before first paint; this is the
        // belt-and-braces branch for a setting that changed mid-load.
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          stop()
          return
        }

        const vw = window.innerWidth
        const vh = window.innerHeight
        const lw = Math.min(vw * 0.84, 620, vh * 1.25)
        const s = lw / logo.W

        setParts({
          logo,
          art: logo.items.filter((p) => p.g === 'a'),
          txt: logo.items.filter((p) => p.g === 't'),
          geo: { vw, vh, lw, s, left: (vw - lw) / 2, top: (vh - logo.H * s) / 2 },
        })
      })
      .catch(() => {
        clearTimeout(giveUp)
        stop()
      })

    return () => {
      cancelled = true
      clearTimeout(giveUp)
    }
  }, [active, stop])

  // Backstop: a crash or a stalled animation must never leave the site hidden.
  useEffect(() => {
    if (!active) return undefined
    const safety = setTimeout(() => stop(), SAFETY_MS)
    return () => clearTimeout(safety)
  }, [active, stop])

  // Esc skips, like the original's click-to-skip.
  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') stop(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, stop])

  // Keep keyboard focus out of the page hidden behind the overlay.
  useEffect(() => {
    if (!active) return undefined
    const root = document.getElementById('root')
    if (!root) return undefined
    const covered = [...root.children].filter((el) => !el.classList.contains('intro-root'))
    covered.forEach((el) => el.setAttribute('inert', ''))
    return () => covered.forEach((el) => el.removeAttribute('inert'))
  }, [active])

  // The sequence itself, once the pieces are on the page.
  useEffect(() => {
    if (!parts) return undefined
    const { logo, geo } = parts
    const art = artRef.current
    const txt = txtRef.current
    const ring = ringRef.current
    const background = bgRef.current
    if (!art || !txt || !ring || !background) return undefined

    let cancelled = false
    const animations = []
    const timers = []
    const random = makeRandom(11)
    let letterIndex = 0

    const pieces = [...art.querySelectorAll('.intro-pc'), ...txt.querySelectorAll('.intro-pc')]
    for (const piece of pieces) {
      const name = piece.dataset.n
      const entry = entryFor(name, random, geo.vw, geo.vh)
      const delay = name[0] === 'L' ? 220 + letterIndex++ * 38 : (ART_DELAY[name] ?? 200)
      const from = `translate(${entry.dx}px, ${entry.dy}px) rotate(${entry.rot}deg) scale(${entry.sc})`

      animations.push(
        piece.animate(
          [
            { transform: from, opacity: 0 },
            { opacity: 1, offset: 0.35 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: entry.dur, delay, easing: EASE, fill: 'both' },
        ),
      )
    }

    const run = async () => {
      await Promise.all(animations.map((animation) => animation.finished.catch(() => {})))
      if (cancelled) return

      // Assembled: one short pulse.
      animations.push(
        ring.animate(
          [
            { transform: 'scale(.3)', opacity: 0.7 },
            { transform: 'scale(2.4)', opacity: 0 },
          ],
          { duration: RING_MS, easing: 'ease-out', fill: 'both' },
        ),
      )
      await new Promise((resolve) => timers.push(setTimeout(resolve, RING_PAUSE_MS)))
      if (cancelled) return

      // Fly the two groups onto the header logo, which shows the same picture.
      const artRect = document.querySelector('[data-intro="art"]')?.getBoundingClientRect()
      const txtRect = document.querySelector('[data-intro="text"]')?.getBoundingClientRect()
      const flying = []

      if (artRect) {
        flying.push(
          art.animate(
            [
              { transform: 'none' },
              {
                transform: `translate(${artRect.left - geo.left}px, ${artRect.top - geo.top}px) scale(${artRect.width / geo.lw})`,
              },
            ],
            { duration: FLY_MS, easing: FLY_EASE, fill: 'forwards' },
          ),
        )
      }
      if (txtRect) {
        const txtTop = geo.top + logo.txtY * geo.s
        flying.push(
          txt.animate(
            [
              { transform: 'none' },
              {
                transform: `translate(${txtRect.left - geo.left}px, ${txtRect.top - txtTop}px) scale(${txtRect.width / geo.lw})`,
              },
            ],
            { duration: FLY_MS, easing: FLY_EASE, fill: 'forwards' },
          ),
        )
      }

      animations.push(
        background.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FLY_MS - 120,
          delay: 120,
          easing: 'ease-in-out',
          fill: 'forwards',
        }),
      )

      timers.push(setTimeout(() => document.documentElement.classList.add('rv-show'), REVEAL_AT_MS))

      await Promise.all(flying.map((animation) => animation.finished.catch(() => {})))
      if (cancelled) return

      markPlayed()
      document.documentElement.classList.remove('intro-on')
      setActive(false)
    }

    run()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      animations.forEach((animation) => animation.cancel())
    }
  }, [parts, stop])

  // Once the intro is over, drop the reveal classes so later renders are plain.
  useEffect(() => {
    if (active) return undefined
    const settle = setTimeout(
      () => document.documentElement.classList.remove('rv-hide', 'rv-show'),
      SETTLE_MS,
    )
    return () => clearTimeout(settle)
  }, [active])

  if (!active) return null

  const { logo, art, txt, geo } = parts ?? {}
  const ringSize = geo ? geo.lw * 0.5 : 0

  return (
    <div className="intro-root" onClick={() => stop(true)} role="presentation">
      <div ref={bgRef} className="intro-bg" aria-hidden="true" />

      {parts && (
        <>
          <div
            ref={artRef}
            className="intro-grp"
            aria-hidden="true"
            style={{ left: geo.left, top: geo.top, width: geo.lw, height: logo.artH * geo.s }}
          >
            {art.map((item) => (
              <Piece key={item.n} item={item} bandTop={0} bandHeight={logo.artH} width={logo.W} />
            ))}
          </div>

          <div
            ref={txtRef}
            className="intro-grp"
            aria-hidden="true"
            style={{
              left: geo.left,
              top: geo.top + logo.txtY * geo.s,
              width: geo.lw,
              height: logo.txtH * geo.s,
            }}
          >
            {txt.map((item) => (
              <Piece
                key={item.n}
                item={item}
                bandTop={logo.txtY}
                bandHeight={logo.txtH}
                width={logo.W}
              />
            ))}
          </div>

          <div
            ref={ringRef}
            className="intro-ring"
            aria-hidden="true"
            style={{
              width: ringSize,
              height: ringSize,
              left: geo.vw / 2 - ringSize / 2,
              top: geo.top + logo.artH * geo.s * 0.5 - ringSize / 2,
            }}
          />
        </>
      )}

      <button type="button" className="intro-skip" onClick={() => stop(true)}>
        Skip intro
      </button>
    </div>
  )
}
