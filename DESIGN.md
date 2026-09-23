# Design

<!-- impeccable:design-schema 1 -->

## World

**Signal** — a warm-paper, ink-and-vermillion editorial system, translated
from the "Neo Mirai" reference world (impeccable.style/neo-mirai): its warm
cream ground, near-black ink, single saturated accent, bold condensed poster
type, and rising-sun motif carry over; the ukiyo-e/futurist-city illustration
subject does not, because Cuttly is link infrastructure, not a conference.
The product's own version of "a signal broadcasting outward" replaces "a
rising sun over a city" — same grammar, own subject.

Two registers share one token set:

- **Persuade** (marketing site, auth): Committed color — vermillion carries
  hero CTAs, and full-bleed dark "ink" bands (API section, footer, the auth
  side panel) alternate against the paper sections, the way the reference
  world punctuates light pages with a dark agenda band.
- **Operate** (dashboard, 46 routes): Restrained — the same paper/ink tokens,
  but vermillion is reserved for primary actions, active nav, and the lead
  data series. Everything else stays neutral so the accent always means
  "act" or "measured."

Light and dark are both real themes (the existing toggle still works); the
"ink band" utility (`.ink-band.dark`) locally forces the dark token set for
one section regardless of the page's theme, which is how the marketing page
gets alternating light/dark bands without a second theme system.

## Palette

Color strategy: Committed on Persuade surfaces, Restrained on Operate.

| Token | Light | Dark |
|---|---|---|
| `background` | `#f3ecdd` (warm paper) | `#171310` (warm ink) |
| `foreground` | `#1c1712` | `#f1e9d8` |
| `card` | `#faf6ec` | `#1d1812` |
| `subtle` | `#ece3ce` | `#221b14` |
| `brand` (accent) | `#d4501e` | `#ec7139` |
| `border` | `#ddd0b0` | `#362b1f` |

One hue carries meaning everywhere: primary buttons, focus rings, active
sidebar state, the lead chart series (`chart-1`), badges, and the signal-ring
motif. Nothing else in the system is saturated.

## Type

- **Display** — Bricolage Grotesque, self-hosted via `next/font/google`
  (`--font-display`). Every `h1`/`h2`/`h3`, card title, button label register,
  and logotype. Applied globally in `app/globals.css` (`h1, h2, h3 { font-family: var(--font-display) }`)
  so it cascades to every route without per-page edits.
- **Body** — Inter (`--font-sans`). Paragraphs, controls, table cells.
- **Mono** — JetBrains Mono (`--font-mono`). URLs, codes, tabular stat
  figures, tracked micro-labels (`.mono-label`).

Display type sets tight and heavy (`tracking-[-0.02em]` to `-0.03em`), with
the hero running up to 78px. No eyebrow/kicker labels above headings
anywhere — that pattern was removed app-wide; headings carry their own
weight.

## Geometry

Mixed on purpose, mirroring the reference world's own mix of rectilinear
photo panels and a round nav pill:

- Panels, cards, inputs: soft rectilinear corners (`--radius-md` 8px /
  `--radius-lg` 12px).
- Every committing button variant (`default`, `destructive`, `secondary`)
  rounds all the way to `rounded-full` — the product's one pill gesture,
  reserved for controls.
- Icon tiles, badges, avatars, and the logo mark are circular.
- Shadows are real (offset + blur), only on things that float: the hero
  search bar, popovers, overlays. Flat panels use a hairline border instead.

## Signature motif

`components/marketing/signal-motif.tsx` — concentric arcs radiating from a
point, in SVG. Stands in for the reference world's rising sun: a link,
broadcasting. Used as a low-opacity background wash behind the hero, the
final CTA, and the auth side panel. Never a raster, never a gradient
standing in for it.

## Components touched

`app/globals.css` (full token/system rewrite), `app/layout.tsx` (fonts),
`components/ui/{button,card,badge,input}.tsx`, `components/marketing/{site-header,site-footer,signal-motif,status-page,legal-page}.tsx`,
`components/auth/auth-shell.tsx`, `components/dashboard/sidebar.tsx`,
`components/app/page-header.tsx`, `app/page.tsx`, `app/hero-shorten-form.tsx`.

Because the dashboard's ~40 routes and every auth screen render through the
shared shell/header/sidebar and the shared `ui/*` primitives, the system
reaches every page through those files rather than per-page edits — verified
directly on the landing page, all auth screens, pricing, contact, a link
status page, and a representative dashboard shell render (`Links` page with
stat cards and badges).

## Open items for a follow-up pass

- A handful of dashboard pages build ad-hoc headers instead of `PageHeader`/
  `SectionHeader` (bio, surveys, action-pages had hand-rolled eyebrow
  patterns already fixed; others may still hardcode `text-2xl font-bold`
  instead of the `.h1`/`.h2` utilities — cosmetic only, on-token color-wise).
- No test/demo account existed in this environment, so live-authenticated
  dashboard pages beyond the verified shell weren't individually
  screenshotted — the token/component cascade covers them, but a pass with
  real data would catch anything a static preview couldn't.
