# DESIGN.md: VAC Tech Jr Design System

Single source of truth for look and feel. **Never hard-code a color, font size or spacing value in a component.** Use the tokens below. If you need something new, add it here first.

Personality: **modern, technical, friendly, student-led.** Clean and confident, with a "developer" feel (monospace accents) but readable for everyone.

> The look comes from the intro animation, `VAC-TECH Jr.html` at the repo root — the club logo's own
> navy, gold and cyan. It is the only palette and the only font pair. Do not introduce another one.
> (The `DESIGN.md` in the repo root is an opencode.ai design analysis and is **not** our design.)

---

## 1. Color tokens

### Brand (from the logo)

| Token | Hex | Use |
|---|---|---|
| `primary` (gold) | `#FFC349` | Primary buttons, links, active nav, rank 1, highlights |
| `primary-hover` | `#FFD37A` | Gold hover |
| `primary-ink` | `#08142E` | Text on gold |
| `primary-text` | `#8A5A00` (light) / `#FFC349` (dark) | Gold used **as text**: raw gold fails AA on light |
| `accent` (cyan) | `#1FD6F7` | Focus ring, circuit traces, small accents |
| `accent-ink` | `#06122A` | Text on cyan |

### Surfaces

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F7F9FF` | `#06122A` | Page background (dark = the logo navy) |
| `surface` | `#FFFFFF` | `#0A1A3B` | Cards, panels, sidebar, modals |
| `surface-alt` | `#EEF2FB` | `#0E2350` | Active nav item, subtle fills |
| `border` | `#D8E0F0` | `#17305E` | Hairline borders and section rules |
| `border-strong` | `#B9C6E4` | `#27487F` | Card outlines, secondary buttons, pills |

### Text

| Token | Light | Dark | Use |
|---|---|---|---|
| `text` | `#06122A` | `#EEF3FF` | Headings and body |
| `muted` | `#4A5A7A` | `#9BACCB` | Secondary text, metadata, labels |

### Status

| Token | Light | Dark | Use |
|---|---|---|---|
| `success` | `#166534` | `#4ADE80` | Approved, success toasts |
| `warning` | `#92400E` | `#FBBF24` | Pending, closing soon |
| `danger` | `#B91C1C` | `#F87171` | Rejected, delete, errors |
| `info` | `#0369A1` | `#38BDF8` | Neutral notices |

> The light values were darkened on 2026-10-19 to pass WCAG AA as text (see section 10). The dark
> values were already fine.

### Project status badges

| Status | Style |
|---|---|
| Pending | `warning` text on soft amber background |
| Approved | `success` text on soft green background |
| Rejected | `danger` text on soft red background |

## 2. Themes (light and dark)

Both themes ship. **Dark is the club's native look** — it is the palette the intro animation uses.
Light is the daytime version. Implemented with CSS variables in `src/index.css`; Tailwind reads them.
The choice is saved per browser (`localStorage`: `theme`) and defaults to the system setting.
`index.html` applies it before first paint, so there is no flash.

| Semantic token | Light | Dark |
|---|---|---|
| `--bg` | `#F7F9FF` | `#06122A` |
| `--surface` | `#FFFFFF` | `#0A1A3B` |
| `--surface-alt` | `#EEF2FB` | `#0E2350` |
| `--border` | `#D8E0F0` | `#17305E` |
| `--border-strong` | `#B9C6E4` | `#27487F` |
| `--text` | `#06122A` | `#EEF3FF` |
| `--muted` | `#4A5A7A` | `#9BACCB` |
| `--primary` (gold) | `#FFC349` | `#FFC349` |
| `--primary-ink` | `#08142E` | `#08142E` |
| `--accent` (cyan) | `#0E7490` | `#1FD6F7` |

Components use **semantic tokens** (`bg-surface`, `text-muted`), not raw palette colors, so both themes work automatically.

> Tailwind v4 is CSS-first: the tokens live in `src/index.css` under `@theme inline`. There is **no**
> `tailwind.config.js` in this project.

Contrast rule: normal text must meet WCAG AA (4.5:1). Gold fails AA as text on light, so gold text
uses `--primary-text` (`#8A5A00`) on light and raw gold on dark.

### Chrome that stays navy

The club logo is drawn for the navy background, so the **header, footer and the intro overlay keep the
dark token values in both themes**. The `.chrome-dark` class in `src/index.css` re-declares the tokens
for that subtree (and sets `color: var(--text)`, since `color` would otherwise inherit from `body`).
Page content still switches with the theme.

## 3. Typography

| Role | Font | Fallback | Source |
|---|---|---|---|
| Headings and body | **Poppins** | system-ui, sans-serif | `@fontsource/poppins` |
| Code, dates, tags, stats, GitHub links | **JetBrains Mono** | ui-monospace, monospace | `@fontsource/jetbrains-mono` |

The same two fonts as the intro animation — never add a third. Self-hosted through `@fontsource`.
Load only the weights used: Poppins 400/500/600/700, JetBrains Mono 400/500.

### Type scale (mobile → desktop)

| Style | Mobile | Desktop | Weight | Line height | Font |
|---|---|---|---|---|---|
| Display (home hero) | 36px | 60px | 700 | 1.1 | Poppins |
| H1 | 30px | 44px | 700 | 1.15 | Poppins |
| H2 | 24px | 32px | 700 | 1.2 | Poppins |
| H3 | 20px | 24px | 500 | 1.3 | Poppins |
| Body large | 18px | 18px | 400 | 1.6 | Poppins |
| Body | 16px | 16px | 400 | 1.6 | Poppins |
| Small | 14px | 14px | 400 | 1.5 | Poppins |
| Caption / label | 12px | 12px | 500 | 1.4 | Poppins |
| Code chip | 13px | 14px | 500 | 1.4 | JetBrains Mono |

Rules: never go below 12px; body text 16px minimum; line length 60-75 characters for reading text.

## 4. Spacing, radius, shadow

- Spacing uses Tailwind's 4px scale. Prefer 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Page container: `max-w-[1180px]`, horizontal padding `clamp(16px, 4vw, 40px)` (matches the intro).
- Section vertical spacing: 56px mobile, 100px desktop.

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Cards, panels, inputs, modals |
| `radius-md` | 6px | Buttons, icon buttons |
| `radius-full` | 9999px | Avatars, pills, tags |

**No shadows.** Depth comes from hairline borders (`border`, `border-strong`) and the dark surface,
exactly like the intro animation. In dark mode borders do all the work.

## 5. Breakpoints

| Name | Width | Layout |
|---|---|---|
| default | 0+ | Single column, bottom or hamburger nav |
| `sm` | 640px | Two-column grids where useful |
| `md` | 768px | Tablet; admin sidebar collapsible |
| `lg` | 1024px | Desktop nav, admin sidebar fixed |
| `xl` | 1280px | Wide content |

Design **mobile first**: base styles are mobile, add `md:` and `lg:` upward.

## 6. Components

**Buttons**
- Primary: gold (`primary`) fill, `primary-ink` text. Secondary: border + text. Ghost: text only. Danger: `danger` fill.
- Height 46px (40px for `size="sm"`), label 15px/600 (14px when small). Radius `radius-md` (6px). Visible focus ring (2px `accent` cyan, 2px offset). Matches the landing page.
- Disabled: 50% opacity, `not-allowed`. Loading: spinner inside, button disabled.

**Inputs**
- Height 44px, `radius-sm`, 1px `border`; focus ring `primary`; error border `danger` with message below.
- Always a visible `<label>`; placeholders are hints, not labels.

**Cards**
- `surface` background, 1px `border`, `radius-sm` (4px), no shadow. A clickable card brightens its border to gold on hover.

**Badges / chips**
- Pill shape, 12px text. Project status uses the status colors above. Tags and class labels use `JetBrains Mono`.

**Navbar**
- Sticky, navy in both themes (`.chrome-dark` so the logo keeps working), 76px tall. Logo slots left, links right, theme toggle, then the session control.
- **Logged out:** "Member login" text link + gold "Join the club" button.
- **Logged in:** the `ProfileMenu` button (photo, or initials when there is no photo) and no Join button.
- Mobile: hamburger opens a drawer with the nav links; logged out it also carries "Member login" and "Join the club". The profile button stays in the header at every size.

**Profile menu** (`ProfileMenu`)
- A round button with the avatar photo, or initials on a gold circle. Opens a dropdown: My profile, My projects, Upload project, Suggestion box, then Admin panel for staff only, then Log out.
- `aria-haspopup="menu"`, `aria-expanded`; closes on Esc, on an outside click, and on choosing an item.

**Section heading** (`SectionHeading`)
- `title` + optional `description` + optional `action`, laid out with the landing page's wrapping `sec-head` rhythm. Used by every public section.

**Admin layout**
- Left sidebar (collapsible on mobile), top bar with user menu. Active item uses `surface-alt` background.

**Tables (admin)**
- Sticky header, zebra optional, row actions on the right, horizontal scroll on mobile, empty state when no rows.

**Modals and dialogs**
- Centered, `radius-sm`, focus trapped, close on Esc. Destructive actions always use a confirm dialog with the item name.

**Toasts**
- Top right (top on mobile, so they never cover the submit button), auto-dismiss in 4s.

**Skeletons / spinners**
- Skeletons for lists and cards; spinner for buttons and small actions.

## 7. Imagery and icons

- Icons: **lucide-react**, 20px default. No mixing icon sets.
- lucide v1 dropped brand icons, so the GitHub mark is an **inline SVG**, not a lucide icon. Take it
  from the club's logo artwork.
- **Logo:** `src/assets/logo-mark.png` (288×100) and `logo-word.png` (352×43) are the header logo,
  flattened once from the intro's 27 pieces at 2.25× so the flying pieces land on identical pixels.
  Do not edit them by hand.
- **Animation source:** the pieces live in `src/components/shared/introLogo.json`. The original
  `VAC-TECH Jr.html` and `VAC-Tech-Jr-Website-Plan.md` were removed from the repo on 2026-10-19, so
  that JSON and the two PNGs are now the **only copy of the logo inside the project** — keep them.
- **Hero visual:** `HeroVisual.jsx` imports `src/assets/hero/robot-placeholder.svg` and nothing else.
  Swap that one file for the real robot artwork; the component and the Home layout stay as they are.
  Keep meaningful `alt` text.
- **No `<canvas>`:** the landing page's circuit traces were dropped. Keep the public pages light.
- Photos: `object-cover`, fixed aspect ratios (BOD 1:1, gallery 4:3, project cover 16:9, event cover 16:9). Lazy load below the fold. Always provide alt text.
- Avatar fallback: initials on `surface-alt` background.
- Placeholder image: a soft neutral block with a small icon, never a broken image.
- Decorative style: subtle dotted grid or code-bracket motifs in hero backgrounds; keep them low contrast.

## 8. Motion

Take the timings from the intro animation so the whole site feels like one piece.
- Durations: 150ms (hover/press), 250ms (menus, modals), 400ms (section reveal), 600-800ms (the home reveal).
- Easing: `ease-out` for hovers; `cubic-bezier(.16,.84,.24,1)` for things assembling; `cubic-bezier(.65,0,.2,1)` for the intro's fly-to-header.
- Reveals are a small `translateY` (about 14px) plus opacity, staggered 40-60ms apart.
- Animate transforms and opacity only; never animate layout properties.
- Respect `prefers-reduced-motion`: `src/index.css` already neutralises animation, and the intro skips itself entirely.
- No auto-playing carousels.

### Intro animation

`src/components/shared/IntroAnimation.jsx` is a faithful port of the animation in the club's landing
page. Same 27 pieces, same sequence, timings and easings — **do not retune the numbers**.

- Plays on `/` only, **once per browser session** (`sessionStorage` key `vacIntroPlayed`), decided
  before first paint by the inline script in `index.html` (so there is no flash).
- Pieces assemble (760–820ms, `cubic-bezier(.16,.84,.24,1)`; wordmark letters staggered 220ms + 38ms
  each, named artwork pieces on fixed delays) → 620ms ring pulse → the two groups fly onto the header
  logo over 720ms (`cubic-bezier(.65,0,.2,1)`) while the overlay fades → the page runs one staggered
  reveal (`html.rv-show .rv`: `translateY(14px)` + opacity).
- The page is **never left hidden**: the logo chunk has a 2s deadline, an 8s backstop, Esc and click
  skip, `prefers-reduced-motion` skips entirely, and `index.html` carries a `<noscript>` fallback.
- The header logo is `[data-intro-brand]`; the landing slots are `[data-intro="art"]` and
  `[data-intro="text"]`. Rename those and the fly-in silently breaks.
- The 27 pieces live in `src/components/shared/introLogo.json` (lazy chunk, ~370 KB) and load only
  when the intro actually plays.

## 9. Voice and copy

- Friendly, clear and short. Address students directly ("Upload your project").
- Plain error messages: "We couldn't save that. Please try again." Never expose technical errors.
- Dates: `18 Oct 2026` style, readable in Nepal time. Show event time with AM/PM.
- Empty states are encouraging: "No events yet. Check back soon."

## 10. Accessibility checklist

Checked on 2026-10-19 against the tokens in section 1. Legend: `[x]` verified, `[ ]` not yet checked.

- [x] **Contrast AA.** Every text/surface pair in both themes was computed with the WCAG relative
  luminance formula. All pass 4.5:1 (`text` 17.7:1 on light bg, 16.8:1 on dark bg; `muted` 6.6:1 /
  8.1:1; gold button label 11.4:1 in both). The light theme's status colours failed and were
  darkened to `success #166534`, `warning #92400e`, `danger #b91c1c`, `info #0369a1` — each now
  ≥5.3:1 on light `bg`, `surface` and `surface-alt`.
  *shortcut: `border-strong` is 1.71:1 against white. It is only ever a hairline around controls
  whose own text carries the meaning, so it is decorative rather than "required to identify" the
  control (WCAG 1.4.11). Upgrade to a `text`-coloured border if a control ever relies on the border
  alone.*
- [ ] Every interactive element reachable and usable by keyboard — spot-checked (profile menu, mobile
  drawer, modals use native `<dialog>`); a full pass is Phase 8.
- [x] Visible focus ring everywhere — one global `:focus-visible` rule (2px `accent`, 2px offset).
- [ ] Alt text on all meaningful images — the hero and logo have it; gallery/BOD arrive in Phase 3.
- [x] Form errors announced and tied to fields (`aria-describedby` in `Input`).
- [x] Touch targets — measured 2026-10-19: desktop nav links **33px**, "Member login" **36px**, the
  small button **40px**, the primary button **46px**, the intro Skip **44px**. WCAG 2.2 AA asks for
  24x24px, so all of these pass. 44px is our own stricter goal, kept for primary buttons and the Skip.
- [ ] Heading order is logical (one H1 per page) — true on every built page; re-check as pages grow.

## 11. Tailwind tokens (CSS-first)

`src/index.css` is the **only** source of the tokens. There is no `tailwind.config.js` here: the values
are CSS variables declared in `:root` (light) and overridden in `.dark`, then exposed to Tailwind with
`@theme inline`.

`@theme inline` keeps the utilities pointing at those variables, so `.dark` overrides them and both
themes work without touching a single component. **Read the values from `src/index.css` — never copy
them into this file.** A second copy drifts: the one that used to live here had already missed the
four status tokens.
