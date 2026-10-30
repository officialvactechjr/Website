# DESIGN.md: VAC Tech Jr Design System

Single source of truth for look and feel. **Never hard-code a color, font size or spacing value in a component.** Use the tokens below. If you need something new, add it here first.

Personality: **modern, technical, friendly, student-led.** Clean and confident, with a "developer" feel (monospace accents) but readable for everyone.

> The look comes from the intro animation, `VAC-TECH Jr.html` at the repo root — the club logo's own
> navy, gold and cyan. It is the only palette and the only font pair. Do not introduce another one.
> (The `DESIGN.md` in the repo root is an opencode.ai design analysis and is **not** our design.)

---

## 1. Color tokens

### Brand (from the logo)

| Token            | Hex                                  | Use                                                    |
| ---------------- | ------------------------------------ | ------------------------------------------------------ |
| `primary` (gold) | `#FFC349`                            | Primary buttons, links, active nav, rank 1, highlights |
| `primary-hover`  | `#FFD37A`                            | Gold hover                                             |
| `primary-ink`    | `#08142E`                            | Text on gold                                           |
| `primary-text`   | `#8A5A00` (light) / `#FFC349` (dark) | Gold used **as text**: raw gold fails AA on light      |
| `accent` (cyan)  | `#1FD6F7`                            | Focus ring, circuit traces, small accents              |
| `accent-ink`     | `#06122A`                            | Text on cyan                                           |
| `accent-soft`    | `#8FA9E0`                            | Footer headings and the social marks (the softer blue) |
| `brand`          | `#2F6BFF`                            | The landing hero's call to action (the club's mock)    |
| `brand-hover`    | `#2456D6`                            | Brand hover                                            |
| `violet`         | `#8B5CF6`                            | The "Introducing" outline on the landing hero          |

### Surfaces

| Token           | Light     | Dark      | Use                                     |
| --------------- | --------- | --------- | --------------------------------------- |
| `bg`            | `#F7F9FF` | `#06122A` | Page background (dark = the logo navy)  |
| `surface`       | `#FFFFFF` | `#0A1A3B` | Cards, panels, sidebar, modals          |
| `surface-alt`   | `#EEF2FB` | `#0E2350` | Active nav item, subtle fills           |
| `border`        | `#D8E0F0` | `#17305E` | Hairline borders and section rules      |
| `border-strong` | `#B9C6E4` | `#27487F` | Card outlines, secondary buttons, pills |

### Text

| Token   | Light     | Dark      | Use                              |
| ------- | --------- | --------- | -------------------------------- |
| `text`  | `#06122A` | `#EEF3FF` | Headings and body                |
| `muted` | `#4A5A7A` | `#9BACCB` | Secondary text, metadata, labels |

### Status

| Token     | Light     | Dark      | Use                      |
| --------- | --------- | --------- | ------------------------ |
| `success` | `#166534` | `#4ADE80` | Approved, success toasts |
| `warning` | `#92400E` | `#FBBF24` | Pending, closing soon    |
| `danger`  | `#B91C1C` | `#F87171` | Rejected, delete, errors |
| `info`    | `#0369A1` | `#38BDF8` | Neutral notices          |

> The light values were darkened on 2026-10-19 to pass WCAG AA as text (see section 10). The dark
> values were already fine.

### Project status badges

| Status   | Style                                   |
| -------- | --------------------------------------- |
| Pending  | `warning` text on soft amber background |
| Approved | `success` text on soft green background |
| Rejected | `danger` text on soft red background    |

## 2. Themes (light and dark)

Both themes ship. **Dark is the club's native look** — it is the palette the intro animation uses.
Light is the daytime version. Implemented with CSS variables in `src/index.css`; Tailwind reads them.
The choice is saved per browser (`localStorage`: `theme`) and defaults to the system setting.
`index.html` applies it before first paint, so there is no flash.

| Semantic token     | Light     | Dark      |
| ------------------ | --------- | --------- |
| `--bg`             | `#F7F9FF` | `#06122A` |
| `--surface`        | `#FFFFFF` | `#0A1A3B` |
| `--surface-alt`    | `#EEF2FB` | `#0E2350` |
| `--border`         | `#D8E0F0` | `#17305E` |
| `--border-strong`  | `#B9C6E4` | `#27487F` |
| `--text`           | `#06122A` | `#EEF3FF` |
| `--muted`          | `#4A5A7A` | `#9BACCB` |
| `--primary` (gold) | `#FFC349` | `#FFC349` |
| `--primary-ink`    | `#08142E` | `#08142E` |
| `--accent` (cyan)  | `#0E7490` | `#1FD6F7` |

Components use **semantic tokens** (`bg-surface`, `text-muted`), not raw palette colors, so both themes work automatically.

> Tailwind v4 is CSS-first: the tokens live in `src/index.css` under `@theme inline`. There is **no**
> `tailwind.config.js` in this project.

Contrast rule: normal text must meet WCAG AA (4.5:1). Gold fails AA as text on a light background, so
gold text uses `--primary-text` (raw `#FFC349`).

### One theme, dark

The site is dark-only and there is no toggle. `:root` in `src/index.css` holds the navy palette; there is
no `.dark` class, no theme state in `index.html` and no `prefers-color-scheme` rule anywhere, so the OS
setting cannot reach the UI. The header, footer and intro overlay therefore sit permanently on the navy
the club logo was drawn for.

## 3. Typography

| Role                                   | Font               | Fallback                | Source                       |
| -------------------------------------- | ------------------ | ----------------------- | ---------------------------- |
| Headings and body                      | **Poppins**        | system-ui, sans-serif   | `@fontsource/poppins`        |
| Code, dates, tags, stats, GitHub links | **JetBrains Mono** | ui-monospace, monospace | `@fontsource/jetbrains-mono` |

The same two fonts as the intro animation — never add a third. Self-hosted through `@fontsource`.
Load only the weights used: Poppins 400/500/600/700, JetBrains Mono 400/500.

### Type scale (mobile → desktop)

| Style               | Mobile | Desktop | Weight | Line height | Font           |
| ------------------- | ------ | ------- | ------ | ----------- | -------------- |
| Display (home hero) | 36px   | 60px    | 700    | 1.1         | Poppins        |
| H1                  | 30px   | 44px    | 700    | 1.15        | Poppins        |
| H2                  | 24px   | 32px    | 700    | 1.2         | Poppins        |
| H3                  | 20px   | 24px    | 500    | 1.3         | Poppins        |
| Body large          | 18px   | 18px    | 400    | 1.6         | Poppins        |
| Body                | 16px   | 16px    | 400    | 1.6         | Poppins        |
| Small               | 14px   | 14px    | 400    | 1.5         | Poppins        |
| Caption / label     | 12px   | 12px    | 500    | 1.4         | Poppins        |
| Code chip           | 13px   | 14px    | 500    | 1.4         | JetBrains Mono |

Rules: never go below 12px; body text 16px minimum; line length 60-75 characters for reading text.

## 4. Spacing, radius, shadow

- Spacing uses Tailwind's 4px scale. Prefer 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Page container: `max-w-[1180px]`, horizontal padding `clamp(16px, 4vw, 40px)` (matches the intro).
- Section vertical spacing: 56px mobile, 100px desktop.

| Token         | Value  | Use                           |
| ------------- | ------ | ----------------------------- |
| `radius-sm`   | 4px    | Cards, panels, inputs, modals |
| `radius-md`   | 6px    | Buttons, icon buttons         |
| `radius-full` | 9999px | Avatars, pills, tags          |

**No shadows.** Depth comes from hairline borders (`border`, `border-strong`) and the dark surface,
exactly like the intro animation. In dark mode borders do all the work.

Depth is sculpted, never cast: the `.sheen` class in `src/index.css` puts a palette-anchored radial
corner light on a surface (gold at low alpha, in both themes) instead of a drop shadow. It intensifies
on `:focus-within`, so a card answers the form inside it. Cards use it; the values live only in
`index.css`.

The landing hero and the login page's brand panel carry the same material at hero scale: `.hero-glow`
(`src/index.css`) is the mascot's halo — a cyan core inside the softer blue field, again a radial light
rather than a shadow. Keep the intro copy on it to at most `accent-soft` 24% at its brightest or the
muted text walks under 4.5:1.

## 5. Breakpoints

| Name    | Width  | Layout                            |
| ------- | ------ | --------------------------------- |
| default | 0+     | Single column, hamburger nav      |
| `sm`    | 640px  | Two-column grids where useful     |
| `md`    | 768px  | Tablet; admin sidebar collapsible |
| `lg`    | 1024px | Admin sidebar fixed               |
| `xl`    | 1280px | Wide content; public desktop nav  |

The public header switches from the hamburger to the inline nav at `xl`, not `lg`: with the Contact
button's label and a staff member's "Back to admin panel" button on the row, the full header no longer
fits at 1024. Below `xl` every header control lives in the hamburger drawer.

Design **mobile first**: base styles are mobile, add `md:` and `lg:` upward.

## 6. Components

**Buttons**

- Primary: gold (`primary`) fill, `primary-ink` text. Secondary: border + text. Outline: `accent`
  hairline with `accent` text and an `accent/10` wash on hover — the informational action, used for
  "View about" beside a gold CTA. Ghost: text only. Danger: `danger` fill.
- Variants: **`primary`** gold, **`secondary`** border + text, **`outline`** cyan (informational
  actions), **`brand`** filled `brand` blue — the landing hero's call to action, from the club's mock
  — plus ghost and danger.
- **`shape="pill"`** swaps the radius to `rounded-full`; the landing hero's pair uses it. Everything
  else stays on the default `radius-md` (6px) — the radius lives in a `SHAPES` map rather than in the
  base class, so a caller never has to out-specify it.
- Height 46px (40px for `size="sm"`, 54px for `size="lg"` — the landing hero's pair), label 15px/600
  (14px when small). Visible focus ring (2px `accent` cyan, 2px offset). Matches the landing page.
- Every variant carries a 1px border, so primary and secondary keep the same edge weight side by side.
- Press: `active:scale-[.98]`; hover and press run 150ms on `--ease-assemble` (section 8). This is the
  button's whole motion budget — no lift, no glow, no shadow.
- Disabled: 50% opacity, pointer events off. Loading: spinner inside, button disabled.

**Inputs**

- Height 44px, `radius-sm`, 1px `border`; focus ring `primary`; error border `danger` with message below.
- Always a visible `<label>`; placeholders are hints, not labels.

**Cards**

- `surface` background, 1px `border`, `radius-sm` (4px), no shadow. A clickable card brightens its border to gold on hover.
- Every `Card` carries the `.sheen` corner light (section 4) and its content is clipped to the radius.
  A field focused inside the card warms that corner; the card never moves or lifts.

**Badges / chips**

- Pill shape, 12px text. Project status uses the status colors above. Tags and class labels use `JetBrains Mono`.
- Variants: `neutral`, `gold`, `success`, `warning`, `danger` (`Badge.jsx`). Status wording stays the same everywhere: projects read "Waiting for review / Approved / Needs changes", change requests read "Waiting / Applied / Declined".

**Selects and yes/no controls**

- A plain `<select>` (not a custom popup), 44px tall, `border`, `radius-sm`, `focus:border-primary`, with a real `<label>` or `aria-label`.
- Binary choices (award vs deduct) use a two-button group with `aria-pressed`, gold for the active side and `danger` for the destructive one.

**Tables (admin)** (`DataTable`)

- One shared table for every admin screen: search box, sortable headers with an arrow, 10-row paging, "Page X of Y" count, empty state that distinguishes "nothing yet" from "no matches".
- Sticky header, horizontal scroll on mobile, row actions on the right as small buttons.
- Client-side on purpose: it searches and sorts one fetch of up to 200 rows (500 for the gallery). Fine for a club; see `MEMORY.md` item 17.

**Lightbox** (gallery)

- Native `<dialog>` at `min(64rem, calc(100vw - 2rem))`, black 80% backdrop, photo contained to 70vh, caption under it, previous/next with arrow-key support and Esc to close.

**Admin sidebar**

- **Top-level destinations only** — Overview, Content, Intake, People, System: one icon and one label
  per row, five rows at every role. A section's own pages are tabs in the contextual toolbar (see
  "Admin layout"), so the column never grows with the panel and **never holds an action**.
- Entries a role may not open are dropped rather than shown empty: the `NAV` array in
  `AdminLayout.jsx` carries a `roles` list, and each route has the matching guard in
  `routes/index.jsx`. A hidden link is never the only defence.
- 240px (`w-60`) wide. Active row: `surface-alt` fill, 1px gold hairline at the left edge, gold icon.

**Navbar**

- Sticky navy, 76px tall (plus its 1px bottom rule). The navy sits at 85% over a `backdrop-blur` (95%
  where the browser cannot blur), so the page reads through the bar without ever eating the white
  wordmark's contrast. Logo slots left, links right, then the session control.
- The current page is a 1px gold hairline under the link, the label at full `text` colour, moving on the
  same 150ms `--ease-assemble` as everything else. In the mobile drawer the same hairline turns vertical
  and sits at the row's left edge. The inline link keeps a 44px hit area through an invisible pseudo
  element (`after:-inset-y-2`), so the gold hairline itself never moves.
- The inline row — nav links, the Contact button, the staff button and the hamburger — shows from `xl`
  up. Below `xl` the hamburger opens the drawer. The logo stays in the header at every size (and shrinks
  below 960px).
- **Contact** is a 44px-high link (`h-11`) with the envelope icon and a visible "Contact" label beside
  it, linking to `/contact`. The same destination is a row in the mobile drawer and a Quick links item
  in the footer, so Contact is reachable at every width.
- **Logged out:** a "Get Started" button (`sm` size, `min-h-11`) beside the session control.
- **Logged in:** the `ProfileMenu` button (photo, or initials when there is no photo; `min-h-11`) and no
  Get Started button.
- **Staff browsing the public site** get a "Back to admin panel" button beside the profile menu (from `sm`
  up; in the drawer below `xl`), and their Log out confirms first. The row moves to `xl` partly so this
  button never squeezes the header.
- Mobile drawer: the nav links, then Contact, then (staff) "Back to admin panel", then (logged out)
  "Get Started". Every row is a large target; the profile button stays in the header at every size.

**Profile menu** (`ProfileMenu`)

- A round button with the avatar photo, or initials on a gold circle. Opens a dropdown: My profile, My projects, Upload project, Suggestion box, then Admin panel for staff only, then Log out.
- `aria-haspopup="menu"`, `aria-expanded`; closes on Esc, on an outside click, and on choosing an item.
- **Log out confirms first.** Every log-out button in the app (here, the admin panel, the "we could not
  load your account" screen) opens the shared `ConfirmDialog` at `sm` — title "Log out?", text "Do you
  really want to log out?", buttons Cancel (focused by default) and Log out. Esc and the backdrop close
  it without signing out. The forced sign-outs (a deactivated account, a failed login) do **not** confirm,
  because they are not a choice the person is making. `useSignOutConfirm` is the one route to all of this.

**Section heading** (`SectionHeading`)

- `title` + optional `description` + optional `action`, laid out with the landing page's wrapping `sec-head` rhythm. Used by every public section.

**Board of Directors** (`BodTree`)

- The board is a hierarchy, not a grid: the president's larger card alone on top, then the vice
  president beside the secretary, then the vice secretary beside the treasurer, then anyone else in
  centred rows. `BOD_ROWS` in `src/features/bod/positions.js` is the order, and `bodRank` places a
  member in it — positions are free text in the admin form, so the matching stays loose. A pair drops
  to one column on mobile.
- **Each row hugs its cards and is centred**, so a card sits directly under the one above and the
  president lands over the gap between the two below. Card widths are capped in `vw` as well as
  `rem`, so a pair still fits side by side on a phone. **No lines are drawn between the levels.**

**Horizontal strip** (`HorizontalMarquee`)

- The one shared looping row, used by the committee band and the past-events strip on Home — there is no
  second copy of the code. `items` is the array of `<li>` cards; the component owns the track, the
  duplicated copy and the controls.
- **Auto mode** (motion allowed, and one copy is wider than the window) loops on a **CSS transform
  only** — no animation library. The track holds the list twice and shifts `-50%`, so the seam lands on
  identical pixels. The second copy is both `aria-hidden` and `inert`: not read, not focusable.
- It **pauses on hover, on keyboard focus inside it, and while the user touches or drags it**. The
  window is a real horizontal scroller (`overflow-x: auto`, scrollbar hidden, fade edges drawn with a
  mask), so touch users can drag it by hand.
- **The Pause/Play button is optional**: the committee band shows it; the past-events strip passes
  `showPause={false}`. Every other safe behaviour above stays in both.
  **Known ceiling:** WCAG 2.2.2 asks for a mechanism to stop auto-moving content, and hover/focus
  pause is not one. The committee band's button satisfies that; the past-events strip now does not —
  turning its `showPause` back on is the one-line fix if a review ever flags it.
- **Too few cards to fill the width: no loop** — no duplicate, no animation. Measured with a
  `ResizeObserver`, never guessed.
- **`prefers-reduced-motion`:** no auto-scroll at all; a plain scroll-snap row with previous/next buttons.
- Card images use `loading="lazy"`, `decoding="async"` and explicit `width`/`height`.

**Events on Home** (`EventStrip` + `fetchHomeEvents`)

- **Upcoming events** (published, future, soonest first, at most 4) is a static responsive grid —
  1 column on phones, 2 from `sm`, up to 4 from `xl` — with a gold "Upcoming" badge, a "View details"
  link, and a "Register" link when that event's registration form is open right now (the existing
  `formState` helper). The section and its heading are **not rendered at all** when there is nothing
  upcoming. A future cancelled event never appears here.
- **Past events** (published, or cancelled with a red "Cancelled" badge; start in the past; most recent
  first, at most 12) is the shared `HorizontalMarquee` strip, with **no Pause button**.
- The two reads live in `fetchHomeEvents` / `useHomeEvents` — the component never calls Supabase. When
  both lists are empty one friendly empty message stands in; when only one exists, only that section
  renders. One "See all events" link always closes the block.

**Page scrollbar and inner scroll areas**

- **The page's own scrollbar is hidden** (`html`/`body` in `index.css`: `scrollbar-width: none`,
  `-ms-overflow-style: none`, and `display: none` on their `::-webkit-scrollbar`). Scrolling itself is
  untouched — wheel, trackpad, touch, arrows, Space, PageUp/PageDown, Home/End and anchor links all
  still work — and nothing occupies its width any more, so there is no empty strip on the right and
  **no sideways jump** when a dialog opens or the content grows. Checked at 360, 768, 1280 and 1920:
  `innerWidth − clientWidth === 0`, no horizontal overflow, the document scrolls, and opening a native
  `<dialog>` moves nothing (the old modal shift was the scrollbar being removed, so hiding it settles
  that too). No `scrollbar-gutter` and no compensating right padding exists, or is needed.
- **Inner scroll areas keep a thin, visible scrollbar** (`.scroll-thin` in `index.css`:
  `scrollbar-width: thin`, plus an 8px `::-webkit-scrollbar` with a `--border-strong` rounded thumb
  that goes `--muted` on hover). It is the only hint that a box holds more, so it stays visible — just
  quiet. Applied to the dialog body (`Modal`), the wide tables (`DataTable`, `BulkImport`), the answer
  panel (`Emails`), the credential slips (`TempPassword`) and the admin drawer with its horizontal
  menu. The `HorizontalMarquee` strips deliberately **keep** their hidden scrollbars.
- **Position is carried by two things instead**: a **3px accent progress line** fixed at the very top
  (`#scroll-progress`) and the **Back to top** circle past 400px. The line is `transform: scaleX()`
  written straight to the node in the scroll handler — no state, so no re-render per frame, and no
  layout work. It hides in the admin panel, under `prefers-reduced-motion`, and on the landing until
  the page moves past the hero; it sits under `env(safe-area-inset-top)` and covers only the header's
  own background, never its content.
  **Known ceiling:** the line shows how far through the page you are, not how many screens are left,
  and anyone who navigates by dragging a scrollbar thumb loses that shortcut. Accepted — scrolling is
  untouched for every input, and the line plus Back to top carry the position cue.

**Site furniture** (`SiteChrome`)

- **Skip link** (keyboard only), the **scroll progress line**, the one-off **cookie note**, and the two
  floating circles: **Contact** (upper) and **Back to top** (lower), bottom-right.
- **Size steps** (`.fab` in `index.css`): **56px** on a phone, **60** from 640px, **64** from 1024px,
  **72** from 1920px — and back to **56** in a window shorter than 500px, so a landscape phone keeps
  both on screen. The icon is `size-[45%]` of the circle at `strokeWidth 2` (measured 24 / 26 / 28 /
  32px). Gap 14px on a phone and 16px above that; inset from the edge 16 / 24 / 32px, always plus
  `env(safe-area-inset-right|bottom)`, so the circles clear the scrollbar and the notch.
  The steps are hand-written, not `size-[..]` utilities: Tailwind sorts a custom `3xl` breakpoint
  _before_ `lg`, so `lg:size-[64px]` would win at 1920 as well.
- **Look**: a solid `bg-brand` circle behind a white icon (4.5:1), a 2px white **ring** and a soft black
  shadow, so it reads over any section. A ring rather than a border, because `Button`'s own variant
  already sets `border-*` and two utilities for one property is a CSS-order coin flip. Hover and focus
  grow to **1.06** and brighten; active presses; every bit of it is `motion-reduce`-guarded. Focus keeps
  the global 3px outline ring.
- **From 1024px up** a small text label ("Contact" / "Back to top") fades in beside each circle on
  hover and focus. `aria-label` names both at every width.
- **Back to top** scrolls smoothly, or instantly under `prefers-reduced-motion`. Both circles fade in
  once the page passes **400px** of scroll, and fade out at the top. While the cookie note is on screen
  the whole stack steps above it. They render on the **public site only** — never inside `/admin` — and
  the intro overlay (z-200) covers them while it plays.
- **Nothing underneath**: checked at 320-1920px and at 640×360 with the page scrolled to the end — no
  overlap with a link, button, input or the cookie note. The footer's legal row carries a matching
  right inset (`pr-[84px] sm:pr-[96px] lg:pr-[108px]`, dropped from `2xl` where the centred 1180px
  container already clears the circles), because its `justify-between` would otherwise leave "Privacy
  Policy" sitting under them.

**Login** (`LoginPage`)

- A `lg` split: the mascot in the halo on the left, the form on the right.
- The tabs (`Login` / `Sign Up`) match the design, but there is **no self sign-up** — the Sign Up
  panel explains that the club hands accounts over in person and links to the membership form.

**Dialogs** (`Modal`, `Lightbox`)

- Both are native `<dialog>` opened with `showModal()`, which gives Esc, focus trapping and the inert page behind for free — but **Tailwind's Preflight sets `margin: 0` on everything, which throws away the browser's automatic centring.** `m-auto` puts it back. Anything else built on `<dialog>` must do the same or it lands in the top-left corner.
- Sizes by content: **`sm` 26rem** (confirm, rename, reject, reset password, change role), **`md` 35rem** (the default — a single form), **`lg` 47.5rem** (form builder, membership window, answers view, email preview, credentials), **`xl` 60rem** (wide tables).
- Height is `max-h-[90vh]` with the dialog as a flex column, so **only the body scrolls and the title stays visible**. On phones the width resolves to `calc(100vw - 2rem)`, giving 16px gutters.
- Clicking the backdrop closes it (the click's target is the dialog itself, never a child).

**Forms inside dialogs**

- `Input` and `Textarea` are `w-full`, so a field always fills its grid cell — without it they fall back to the browser's ~20-character default width.
- Short fields (class, section, phone, GitHub) go two-up from the `sm` breakpoint; long fields (full name, email, text areas, password options) span the full width.
- Buttons sit in a right-aligned row at the end of the form. On phones that row wraps and the buttons go full width.

**Mascot scene** (`MascotScene`)

- Wherever a mascot appears — the landing hero, the Home hero, the login's brand panel — it is
  **centred inside its halo with the club's floating objects around it**. The objects are one packed
  sheet (`src/assets/hero/particles.webp`), placed at the container's full width and centred
  vertically, so they fan out either side of the mascot instead of drifting with the viewport. The
  container is square and sized by height, so the composition holds at any width.
- **The landing hero stacks `Introducing` / the mascot / `VAC Tech Jr`** so the robot stands between
  the two lines and both overlap it. **Both overlaps are a fraction of the headline size**
  (`--head` in `index.css`; the word sits ~47% of the robot's height into it, the gold word covers the
  robot's lower ~40%), so the composition keeps its proportions at any window shape. Do **not**
  express these overlaps in `vw`: the robot is sized in `vh`, and a `vw` overlap on a `vh` box buried
  the words on wide, short screens. "Introducing" is drawn in `violet`; "VAC Tech Jr" in gold with a
  short extruded shadow. There is no welcome paragraph on the landing — the Home page carries that
  copy.
- **The landing is: hero first screen → committee band → footer.** The hero is a
  `min-h-[calc(100dvh-77px)]` column under the header (76px + its 1px rule) and fills and centres inside
  it, so **on load the hero is the only thing visible** and nothing below it peeks in. The page then
  scrolls normally: the auto-scrolling committee band (`CommitteeMarquee`) sits directly under the
  fold, and `PublicLayout`'s footer follows it. The floating contact / back-to-top buttons appear on
  the landing too, past 400px of scroll. Every hero size is capped in `vh` as well as `vw` (`--head`,
  the robot's `min(48vh,58vw,480px)`, the padding), so the tagline sits **below** the robot's body and
  the buttons below that at all of 360×640, 390×844, 768×1024, 1024×768, 1280×720, 1366×768 and
  1920×1080 (checked) — nothing cut off, and the tagline/buttons never reach the robot's face. The
  `dvh` (not `svh`) keeps the hero equal to the visible height as browser chrome moves.
- **The committee band lives on the landing only** — never on `/home`, so there is no duplicate. Home
  keeps the static Board of Directors tree and the committee-heads row.
- **The band's cards are roomy, not a thin strip.** Each `<li>` is 280px wide on a phone
  (`min(280px,80vw)`), 340 at `sm` and 400 from `lg`, with no gap between them, so the centres sit
  exactly that far apart. Inside, centred: a cyan lucide line icon at 40px (`size-10`,
  `strokeWidth 1.5`), a 22px semibold title (`leading-tight` — may wrap to two lines on a phone) and a
  17px muted description on `leading-[1.45]`, reserving `2.9em` so single-line cards keep the row
  aligned. Padding is 36/40px on a phone and 40/44 from `sm`. **Measured band height: 222px from
  1024px up, 267px on a phone** — nothing clipped, no horizontal overflow outside the strip, at 360,
  390, 768, 1024, 1280, 1536 and 1920. The section is `bg-surface` (one step lighter than the page
  navy) with the usual `border-y border-border` and the marquee's soft left/right mask.
  **Known ceiling:** the 210-230px phone height in the brief is unreachable while its own type sizes
  stand — the longest title wraps to two lines and a 66-character description to three at 280px, both
  of which the brief allows. Shrink the type if the phone band must come down.
- **"Join a Team" is the one linked card** (to `/join`); it clears the 44px touch target on its own
  height. The other cards are plain text.
- **The halo washes the whole hero** (`.hero-glow-full`, a much wider radial than the mascot-sized
  `.hero-glow`), and **the objects are spread across the page**, not clustered on the robot: the
  packed sheet is sized `min(1600px, 92vw, calc((100svh - 76px) * 1.42))`, so it reaches most of the
  width and every object stays inside the frame. The vertical factor is the one that matters — the
  sheet is centred on the _robot_, which sits above the hero's middle, so a height-true sheet hangs
  out of the top. Spreading the sheet also scales the objects up; splitting it into individual
  objects is the fix if they ever look too large.
- **The objects drift in from the centre**: `.hero-particles` runs `vac-particles-in` for **9s** and
  settles at **0.45 opacity**, so they read as background rather than props. The pace is deliberate:
  they arrive quickly (~0.9s brings them to 0.28 opacity and 0.87 scale) and then creep the last of
  the way for the remaining eight seconds. The transform lives in the keyframes, not in utilities,
  because the animation owns it end to end. `prefers-reduced-motion` snaps to the end state.
- **The intro overlay's pace is tunable by the owner.** It was sped up once and then slowed back to
  roughly the original (fly 720ms, ring 620ms, pause 240ms, entries 760/820ms, letters 220ms + 38ms).
  The comment in `IntroAnimation.jsx` says so; that file is the place to change it.
- **Headline and logo sizes are the largest that still fit.** `--head` is
  `clamp(1.75rem, min(9vw, 13vh), 6.5rem)` (99px at 1440×760) and the header logo is `--logo-w: 110px`
  (76px below 960px). Growing the headline is nearly free — the two overlaps grow with it, so the
  hero's height barely changes — but the robot's `vh` share is what decides whether the page still
  fits: it was tuned against a 1024×600 window, the tightest case.

**Membership questions** (`MEMBERSHIP_FIELDS`, the `Standard membership` template)

- Name, **faculty**, class, section, email, **skills / bio** and **the committee they want to join**
  (Coding, Graphics Design, ECA, PR), plus the consent line. `faculty`, `skills` and `committee` are
  extra questions, so they live in `membership_applications.answers`; the rest keep their columns.
  A window renders its own snapshot, so a window made before `0011` still shows the old questions.

**Admin layout**

- Three stacked bands, then the page. **Sidebar** (240px) holds the five top-level destinations and
  nothing else; **header** carries the global tools — the club logo linking to `/admin`, a "View
  website" button (globe + a short "View" label on phones, "View website" from `sm` up) and the profile
  menu — so they are reachable from every screen without scrolling back up; **contextual toolbar**
  carries the open section's pages as horizontal tabs (gold 2px underline on the active one). Both the
  header and the toolbar are `sticky` (`top-0` / `top-16`), so a long table never takes the section nav
  away.
- The header logo is `logo-mark.webp` (alt "VAC Tech Jr") with `logo-word.webp` beside it from `sm` up,
  both `w-auto` so they keep their ratio and a step smaller on phones. It is a plain image **on purpose**:
  the public header's `[data-intro]` slots belong to the intro animation's fly-in and must not be reused.
- **"View website" opens `/` in the same tab and sets `vacViewSite` for the session**, so the public site
  is browsable and `/` no longer bounces back to the panel; the public navbar then offers "Back to admin
  panel". A staff browser also carries `vacStaff` (cleared on sign-out) that redirects `/` to `/admin`
  before first paint — so there is no flash — and members and visitors are never affected.
- A section with one page draws no toolbar, so `/admin` is just a header and the page.
- **`NAV` in `AdminLayout.jsx` is the only navigation source**: `items` are a section's pages and each
  entry's `page` is resolved by longest matching URL prefix. A section the role cannot open is dropped
  rather than shown empty — see "Admin sidebar" above.
- Form actions, filters and batch operations do **not** live in the chrome: they belong to the page
  (`PageHeader`'s `action` slot, `DataTable`'s `toolbar`) or to the row itself. Nothing in the sidebar
  is ever clickable except a destination.
- Depth in the panel comes from borders alone, like everywhere else — the mobile drawer only dims the
  page behind it.

**Modals and dialogs**

- Centered, `radius-sm`, focus trapped, close on Esc. Destructive actions always use a confirm dialog with the item name.
- The dialog and the lightbox both enter with `animate-pop` (fade + 0.96 scale, 250ms) and their backdrop
  with `animate-fade`, so every dialog in the site opens the same way (section 8).

**Dropdowns (profile menu)**

- Opens with the same `animate-pop` from its top-right corner. Items answer on hover with `surface-alt`.

**Toasts**

- Top right (top on mobile, so they never cover the submit button), auto-dismiss in 4s for successes. Errors are toast text as well, in plain language.

**Skeletons / spinners**

- Skeletons for lists and cards; spinner for buttons and small actions. A table page shows a spinner block; a card grid shows shaped skeletons; a button shows the spinner inside itself and disables.

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
- Photos: `object-cover`, fixed aspect ratios (BOD 1:1, gallery 4:3, project cover 16:9, event cover 16:9). Lazy load below the fold. Always provide alt text. **Event covers are uploaded capped at 1200px wide** (`ImageUpload maxEdge`), because they only ever show in the Home strip card; an image already under the cap is uploaded untouched and never re-compressed.
- **Every content image carries explicit `width` and `height` attributes** as well as its CSS aspect ratio, so nothing reflows when it arrives. Decorative images use `alt=""`; the avatar fallback is initials on `surface-alt`.
- Placeholder image: a soft neutral block with a small icon, never a broken image.
- Decorative style: subtle dotted grid or code-bracket motifs in hero backgrounds; keep them low contrast.

### The tab icon (favicon and app icons)

**The rule: the logo's central symbol fills the square on the site navy.** The emblem in
`src/assets/logo-mark.webp` is 210×73 — nearly 3:1 — so at tab size it renders as a thin bar in a mostly
empty tile, which is exactly how the old `icon-32.png` looked. The tab icon is therefore **the central
symbol only** (the open book and its gold rod; the thin circuit rays either side are dropped) on a solid
navy rounded square, scaled to fill about **90% of the tile** (about 5% padding). Navy is `--bg`
`#06122a`, the same token as the manifest's `theme_color`/`background_color`, so the mark stays visible
on a light and a dark browser theme alike.

- **Files, all in `public/`** (served as-is at the site root): `favicon.ico` (16 + 32 + 48),
  `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180, **opaque** navy with ~10%
  padding — Apple applies its own mask, so it is not pre-rounded), `icon-192.png`, `icon-512.png`,
  `icon-maskable-512.png` (full-bleed navy, symbol at ~66% so it survives Android's safe-zone crop), and
  `manifest.webmanifest`.
- **There is no `favicon.svg`.** There was never a clean one, and a wrong icon is worse than none; the
  symbol is a raster. The old Vite `favicon.svg` reference was removed. `docs/ARCHITECTURE.md`'s folder
  tree lists the real files.
- **`index.html`** declares `favicon.ico`, the 32 and 16 PNGs, the apple-touch icon, the manifest, and
  `<meta name="theme-color" content="#06122a">`. **Every icon URL carries `?v=2`** — browsers cache
  favicons for months, so a changed icon needs a changed URL before anyone sees it. **Bump that suffix
  whenever an icon file changes.**
- **Regenerate from `src/assets/logo-mark.webp` if the logo ever changes.** The cut is: trim the
  transparent margin → crop the central window (source x 59-151, dropping the rays) → blank the thin
  hairlines inside it (the circuit stub at the top right, and the four gold tick marks above the book —
  they turn to noise at 16px) → autocontrast → paste on the navy tile at 90% with a 22% corner radius,
  and give the 32px-and-below renders a 1px alpha dilation so strokes survive at tab size. A one-off
  Pillow script does this; it is deliberately **not committed and not a dependency** — the output files
  are the artefact. The exact crop/mask coordinates are above for the next person.
- **Legibility:** checked on a contact sheet at 16, 32, 48, 180 and 192px on both a white and a dark
  background. At 16px the fine detail is gone by definition, but the gold rod over the pale book still
  reads; from 32px up the book is unmistakable.

## 8. Motion

Take the timings from the intro animation so the whole site feels like one piece.

- Durations: 150ms (hover/press), 250ms (menus, modals), 400ms (section reveal), 600-800ms (the home reveal).
- Easing: `ease-out` for hovers; `ease-assemble` — the token in `src/index.css`, value
  `cubic-bezier(.16,.84,.24,1)` — for things assembling; `cubic-bezier(.65,0,.2,1)` for the intro's
  fly-to-header. Use the token, never a raw curve, in a component.
- Reveals are a small `translateY` (about 14px) plus opacity, staggered 40-60ms apart.
- Animate transforms and opacity only; never animate layout properties.
- Respect `prefers-reduced-motion`: `src/index.css` already neutralises animation, and the intro skips itself entirely.
- **No auto-playing carousels — except the `HorizontalMarquee` strips**, the one deliberate exception.
  Their motion rules (pause on hover/focus/touch, the Pause button, reduced motion, no loop when the row
  is short) are in its entry under Components, section 6.

### Micro-interactions (the tactile layer)

One vocabulary, used everywhere, so the site answers the hand the same way in every corner:

- **Press.** Buttons take `active:scale-[.98]` at 150ms on `--ease-assemble`. Transform only, so nothing
  reflows and the grid never moves. That single-scale press is the whole tactile budget — no lift, no
  shadow, no bounce.
- **Hover.** 150ms, `--ease-assemble`, and only ever a colour or a hairline: gold border on a card, `primary-hover`
  fill on a primary button, an `accent/10` wash on an outline button. Hover never moves an element in this system.
- **Entry.** Menus and dialogs use `animate-pop` (`vac-pop`: opacity 0 → 1 with `scale(.96)` → 1) at 250ms
  on `--ease-assemble`, and a dialog's backdrop uses `animate-fade` at the same timing. Both live in `src/index.css`. Nothing else in the site scales in — the
  entrance is reserved for surfaces that were not there a moment ago.
- **Focus.** The card corner light (section 4) warms on `:focus-within`; the focus ring itself is the
  global cyan one from section 10 and never changes.
- Every one of these is neutralised by the reduced-motion rule above, which zeroes animation and
  transition durations globally.

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

Checked on 2026-10-19 (tokens, contrast) and re-checked on **2026-10-20** (structure, focus, labels,
headings, targets). Legend: `[x]` verified in code, `[ ]` still to be confirmed on a real device.

- [x] **Contrast AA.** Every text/surface pair in both themes was computed with the WCAG relative
      luminance formula. All pass 4.5:1 (`text` 17.7:1 on light bg, 16.8:1 on dark bg; `muted` 6.6:1 /
      8.1:1; gold button label 11.4:1 in both). The light theme's status colours failed and were
      darkened to `success #166534`, `warning #92400e`, `danger #b91c1c`, `info #0369a1` — each now
      ≥5.3:1 on light `bg`, `surface` and `surface-alt`.
      _shortcut: `border-strong` is 1.71:1 against white. It is only ever a hairline around controls
      whose own text carries the meaning, so it is decorative rather than "required to identify" the
      control (WCAG 1.4.11). Upgrade to a `text`-coloured border if a control ever relies on the border
      alone._
- [x] **Accent as text (the `outline` button) checked 2026-10-20.** `accent` `#0e7490` reads 5.36:1 on
      light `surface`, 5.09:1 on light `bg`, 4.78:1 on light `surface-alt`; `#1fd6f7` reads 9.82:1 on
      dark `surface`. AA everywhere, so an outline button may carry `accent` text in both themes.
- [x] Every interactive element reachable and usable by keyboard — modals and the lightbox are native
      `<dialog>` (so Esc, focus trapping and the top layer come free); the profile menu and the mobile
      drawer open with Enter, close on Esc and on an outside click; the lightbox also takes the arrow
      keys; the points direction buttons expose `aria-pressed`.
- [x] Visible focus ring everywhere — one global `:focus-visible` rule (2px `accent`, 2px offset), and
      no component sets `outline: none` (`Input.jsx` says so in a comment).
- [x] Alt text on all meaningful images — the hero and logo have it; gallery photos use their title,
      BOD photos use "Photo of …", and decorative images use an empty `alt`.
- [x] Form errors announced and tied to fields (`aria-describedby` in `Input` and `Textarea`), plus
      `aria-invalid`.
- [x] Touch targets — measured 2026-10-19: desktop nav links **33px**, "Member login" **36px**, the
      small button **40px**, the primary button **46px**, the intro Skip **44px**, the sidebar menu
      button **44px**, modal and lightbox close buttons **44px**. WCAG 2.2 AA asks for 24x24px, so all
      of these pass. 44px is our own stricter goal, kept for primary buttons, toolbars and the Skip.
- [x] Heading order is logical — one `h1` per page (`PageHeader` on every interior page, the hero on
      Home), `h2` for sections (`SectionHeading`) and card titles, `h3` inside a card or a BOD tile.
      The footer's group titles are `h2` inside their own `nav[aria-labelledby]` landmarks.
- [x] **Code-level mobile check at 360px (2026-10-20).** No fixed widths outside a contained scroller:
      `DataTable` scrolls inside its own box (`min-w-[44rem]` + `overflow-x-auto`), dialogs are
      `min(…, calc(100vw - 2rem))`, the navbar logo shrinks below 960px, and the admin sidebar becomes
      a menu button. Section 11 of `docs/TESTING.md` keeps the real-device pass for the testing team.
      _shortcut: verified by reading the CSS, not by eye — the browser harness in that session could
      not reach the dev server (`MEMORY.md` item 26)._
- [x] **Header, one screen and buttons checked 2026-10-30** in a same-origin iframe harness at 320,
      360, 390, 414, 768, 1024, 1280, 1536 and 1920px wide: the header never wraps, overlaps or clips
      (`headerInner.scrollWidth == clientWidth` at every width), the inline row is replaced by the
      hamburger below `xl`, and every header control is at least 44px tall or wide (Contact `h-11`,
      hamburger `size-11`, logo/profile/buttons `min-h-11`; the nav links keep a 48px hit area from a
      pseudo element). The landing fits exactly one screen — `scrollHeight == clientHeight`, no
      horizontal overflow — at 360×640, 390×844, 768×1024, 1024×768, 1280×720, 1366×768 and 1920×1080,
      with the tagline below the robot and the buttons on screen. The harness could not scroll, so the
      Back to top reveal was proven by dispatching scroll state (hidden at ≤400px, shown at >400px), not
      by eye.

## 11. Tailwind tokens (CSS-first)

`src/index.css` is the **only** source of the tokens. There is no `tailwind.config.js` here: the values
are CSS variables declared in `:root` (light) and overridden in `.dark`, then exposed to Tailwind with
`@theme inline`.

`@theme inline` keeps the utilities pointing at those variables, so `.dark` overrides them and both
themes work without touching a single component. **Read the values from `src/index.css` — never copy
them into this file.** A second copy drifts: the one that used to live here had already missed the
four status tokens.
