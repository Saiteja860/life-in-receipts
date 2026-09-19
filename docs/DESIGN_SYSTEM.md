# Design system

One design idea — **the thermal receipt** — carried through every surface. Cream paper,
monospace ink, dashed dividers, a CSS barcode and a jagged tear-off edge. The cover is the
same idea at the other end of the scale: a decoding terminal.

## Tokens (`src/styles.css` → `:root`)

### Colour

| Token | Dark | Light (`prefers-color-scheme: light`) | Used for |
|---|---|---|---|
| `--bg` | `#17130f` | `#efe7d8` | Page background |
| `--bg-soft` | `#201a14` | `#f7f1e2` | Panels: explorer bar, insight cards |
| `--paper` | `#f6efdd` | `#fffdf6` | The receipt surface (always a paper colour) |
| `--ink` | `#2b2118` | `#241c14` | Ink printed on receipts; text on active nav pill |
| `--text` | `--paper` | `#241c14` | Text on the page background |
| `--muted` | `#a3968a` | `#6a5c4d` | Secondary copy, labels, hints |
| `--accent` | `#c9754b` | `#a9542b` | Brand accent: kicker, big statistics, focus affordances |
| `--focus` | `#6f9fd8` | `#6f9fd8` | Focus outline (deliberately non-brand so it never blends in) |

**Why `--text` exists separately from `--paper`:** the receipt surface must stay cream in
both themes, while page text must invert. Splitting the tokens is what makes the light theme
possible without touching a single component rule.

Per-receipt ink and per-chapter colour are set inline as CSS custom properties from data
(`--ink`, `--chapter`), never hard-coded in CSS. Chapter accents:

| Chapter | Colour | Chapter | Colour |
|---|---|---|---|
| 01 The Quiet After | `#7c8aa0` | 05 New City, New Frequency | `#a06bc9` |
| 02 Small Rebellions | `#6ea86b` | 06 Two Straws, One Milkshake | `#d16a7f` |
| 03 The Interview Gauntlet | `#c9a24b` | 07 Six Strings | `#b07f3f` |
| 04 Salt Air & Scooters | `#4fa3a5` | 08 The Long Way Home | `#c9754b` |

### Type scale (fluid, `clamp()`)

| Token | Range | Used for |
|---|---|---|
| `--step--1` | 0.68 → 0.75 rem | Labels, hints, footer, caption text |
| `--step-0` | 0.875 → 1 rem | Body default |
| `--step-1` | 1 → 1.2 rem | Lead paragraphs, search input, chapter blurbs at ≥ 900 px |
| `--step-2` | 1.15 → 1.5 rem | View titles on compact screens, section headings |
| `--step-3` | 1.35 → 2 rem | View titles (`h1.view-title`) |
| `--step-4` | 2.5 → 5.25 rem | The cover headline |

Two families only: `--mono` (Courier Prime → Courier New → monospace) for anything that is
"printed" — receipts, statistics, meta rows, kickers; `--sans` (Archivo → system-ui) for
everything read as prose. No icon font: icons are emoji or text glyphs.

### Space, radius, motion

`--space-1…--space-6` (6/10/16/24/36/60 px) · `--radius` 14 px · `--radius-pill` 999 px.
Motion is limited to three purposes: **reveal** (skeleton sweep), **respond** (hover lift on
buttons, 120–150 ms) and **explain** (lens fade/glow, 200 ms). Nothing animates on a loop.

## Contrast (measured against the tokens)

| Pair | Ratio | Result |
|---|---|---|
| `--text` on `--bg` (dark) | ≈ 14.8:1 | ✅ AAA |
| `--muted` on `--bg` (dark) | ≈ 5.6:1 | ✅ AA (body), AAA for large |
| `--ink` on `--paper` | ≈ 13.4:1 | ✅ AAA — the whole archive is printed at AAA |
| `--accent` on `--bg` (dark) | ≈ 5.4:1 | ✅ AA |
| `--text` on `--bg` (light) | ≈ 13.9:1 | ✅ AAA |
| `--muted` on `--bg` (light) | ≈ 5.1:1 | ✅ AA |
| `--focus` outline on both backgrounds | ≈ 4.9:1 (dark) / 3.5:1 (light) | ✅ ≥ 3:1 for non-text UI |

Under `prefers-contrast: more`, `--muted` is raised to `#d8cec2` (dark) and chip/receipt
borders become solid, pushing every secondary pair past 7:1.

## Component inventory

| Primitive | File | Owns |
|---|---|---|
| `ReceiptCard` | `components/ReceiptCard.jsx` | The tilt (deterministic id hash), barcode, meta rows, lens states, focus/hover wiring |
| `ReceiptRows` | `components/ReceiptRows.jsx` | Field order, printed labels, currency formatting — shared by card and modal |
| `ReceiptModal` | `components/ReceiptModal.jsx` | Dialog semantics, focus trap, thread list with reasons |
| `Chapter` | `components/Chapter.jsx` | Chapter header, mood stamp, container-query grid, preview/expand |
| `TopNav` | `components/TopNav.jsx` | Brand, nav links (`aria-current`), compact disclosure |
| `Cover` | `components/Cover.jsx` | Decoding sequence (skipped under reduced motion), headline stats |
| `AppFooter` | `components/AppFooter.jsx` | Provenance, connection report, keyboard contract |
| `Announcer` | `components/Announcer.jsx` | The single polite live region |
| `ViewLoading` | `components/ViewLoading.jsx` | Suspense skeleton with an announced status |
| `ErrorBoundary` | `components/ErrorBoundary.jsx` | Crash surface + reload |
| `insights/*` | `components/insights/` | `StatCard`, `BarMeter`, `MonthBars`, `MoodArc`, `HourHeatStrip`, `CuriosityLog` |

Every chart primitive follows one rule: **the picture is decorative, the numbers are text.**
The SVG carries a generated label, and the same data is emitted as a visually hidden list.

## Copy rules

- Mono/uppercase for system voice: `THE DIGITAL LIFE ARCHIVE`, `MOOD: HEAVY`, `#011`.
- Sentence case for the human voice: chapter titles, blurbs, empty states.
- Numbers always carry units and context ("22% of all 23 logged plays", never "22%").
- Empty states keep the metaphor but stay useful: *"No receipts match. The archive keeps its
  secrets — try clearing a filter."*