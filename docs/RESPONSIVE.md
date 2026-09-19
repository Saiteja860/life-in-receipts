# Responsive design

## Strategy

**Fluid first, breakpoints second.** Layouts are built from `auto-fit`/`minmax` grids,
`clamp()` typography and container queries, so most responsiveness needs no media query at
all. The media queries in `src/styles/responsive.css` exist only for what intrinsic sizing
cannot express: column counts at the extremes, navigation behaviour, input-modality rules
and large-screen line-length caps.

All adaptive CSS lives in **one file** (`src/styles/responsive.css`, six labelled sections),
so the responsive surface can be audited in a single read. No component contains a media query.

## Breakpoint ladder

| Width | Target | What changes |
|---|---|---|
| ≤ 359 px | Smallest supported phones | Tighter stat gaps, smaller padding, thinner heat strip, smaller bar labels |
| ≥ 360 px | Base comfortable phone | Fluid type steps up; grids stay 1–2 columns |
| ≤ 560 px | Phones | Nav collapses to a disclosure button; single-column Patterns; modal padded for thumbs |
| ≥ 561 px | Nav inline again | `ul.nav-links[data-open] { display: flex }` — the drawer state is ignored |
| ≤ 720 px | Compact viewport (matches `useIsCompactViewport`) | Patterns rows stack, footer stacks, modal capped to `100dvh - 32px` with internal scroll |
| 721–959 px | Tablet portrait | Patterns becomes a 2-column row |
| ≥ 900 px | Tablet landscape / small laptop | Chapters get real padding; blurb steps up a size |
| ≥ 1200 px | Large laptop | `main` grows to 1240 px; four Pattern cards per row |
| ≥ 1600 px | Desktop / ultrawide | `main` capped at 1320 px, cover at 720 px — line length capped instead of stretching cards |

## Input modality, not just width

| Query | Rules |
|---|---|
| `(hover: none), (pointer: coarse)` | 44 px minimum targets; **card tilt removed** (a rotated card invites tap misses); taller heat cells; taller range input; more disclosure padding |
| `(hover: hover) and (pointer: fine)` | Hover affordances that are only safe with a precise pointer |
| `(orientation: landscape) and (max-height: 560px)` | The cover stops being full-height so its CTA cannot be clipped by browser chrome; sticky nav disabled to reclaim vertical space |
| `(min-width: 600px) and (max-width: 900px)` | Body copy capped at 62ch for comfortable tablet reading |

The Connection Lens follows the same split: with no hover, **focus** drives it (see
`ReceiptCard`), so touch and keyboard users get the feature mouse users get.

## Container queries

Chapters are container contexts (`container-type: inline-size`), so a chapter adapts to *its
own* width rather than the viewport's:

| Chapter width | Grid |
|---|---|
| ≤ 420 px | 1 column |
| ≥ 680 px | 3 columns |
| ≥ 1040 px | 4 columns |

The same `<Chapter>` therefore renders correctly inside a narrow column and at full width
without extra classes or prop flags — possible because the component owns its layout rules.

## Fluid primitives

| Concern | Mechanism |
|---|---|
| Grid columns | `repeat(auto-fill, minmax(clamp(160px, 46vw, 230px), 1fr))` |
| Page gutters | `padding-inline: clamp(14px, 4vw, 28px)` |
| Vertical rhythm | `clamp(48px, 12vw, 90px)` bottom padding |
| Type scale | `--step--1 … --step-4`, each a `clamp()` min→max pair ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) |
| Cover headline | `--step-4` → 2.5 rem at 320 px, 5.25 rem at 1440 px |
| Big statistics | `clamp(28px, 7vw, 38px)` |
| Modal height | `calc(100dvh - 32px)` on compact viewports (dynamic viewport, not `100vh`) |
| Notch / home bar | `env(safe-area-inset-*)` on the cover |

## Preference queries

| Query | Behaviour |
|---|---|
| `prefers-color-scheme: light` | Full light theme: tokens re-pointed, plus separately adjusted topnav/cards/chips/chart tracks |
| `prefers-contrast: more` | Muted text and borders raised; chip borders solid; receipt row labels at higher opacity |
| `prefers-reduced-motion: reduce` | All transitions/animations off; smooth scroll disabled; card hover translation removed; skeleton pulse removed |
| `prefers-reduced-data: reduce` | Decorative shred and barcodes hidden |
| `forced-colors: active` | Receipts onto `Canvas`/`CanvasText`, borders preserved so shapes stay distinguishable |
| `min-resolution: 2dppx` | Slightly taller chart tracks and hairlines that survive high DPI |

## Verification matrix

Spot-check these before release (documented rather than automated — see
[TESTING.md](TESTING.md)):

| Check | Width / setting | Pass criteria |
|---|---|---|
| Narrowest supported | 320 × 568 | No horizontal scroll, no clipped text, nav drawer usable |
| Standard phone | 390 × 844 (or a real device) | Tap targets comfortable, cards not tilted, drawer closes on navigation |
| Landscape phone | 667 × 375 | Cover CTA visible without scrolling; sticky nav disabled |
| Tablet portrait | 768 × 1024 | Patterns 1 column, charts legible, chapter grid 3 columns |
| Tablet landscape | 1024 × 768 | Patterns 2 columns, chapter grid 3 columns |
| Laptop | 1440 × 900 | 4 Pattern cards, 4-column chapter grid, comfortable line length |
| Ultrawide | 1920 × 1080 and 2560 × 1440 | Content capped, no stretched receipts, no empty gutters |
| Zoom | 200% and 400% | Everything reflows; nothing clipped or overlapping |
| Print | A4 portrait | Chapter-per-page breaks, no interactive chrome, receipts unbroken |
| Touch emulation | DevTools "no hover" | Lens reachable by tap/focus; tilt off; targets ≥ 44 px |

## Known trade-offs

- **Card tilt is disabled on touch devices.** The tilt is part of the design language, but a
  rotated target measurably increases mis-taps; hover-capable devices keep it.
- **The compact nav is a disclosure, not a full-screen drawer.** For four items, a drawer with
  a scrim would add focus-management complexity for no layout gain.
- **Charts keep horizontal orientation on small screens** rather than switching to tables;
  the text alternatives are what make them accessible, and bar lengths at 320 px stay readable.
- **`clamp()` underestimates on very short viewports**, which is why the landscape-phone query
  exists as a targeted correction.
- **Container queries require Safari 16+.** Older Safari falls back to the viewport-based grid
  from the ladder above, which is a graceful degradation rather than a broken layout.