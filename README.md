# 🧾 Your Life, In Receipts — The Archive

**A frontend-only digital journey through one person's year, told as 163 receipts.**

[![CI](https://img.shields.io/badge/CI-lint%20%C2%B7%20test%20%C2%B7%20build-brightgreen)](#quality-gates)
[![Tests](https://img.shields.io/badge/tests-99%20passing-brightgreen)](#quality-gates)
[![Coverage](https://img.shields.io/badge/coverage-93%25%20statements-brightgreen)](#quality-gates)
[![Initial payload](https://img.shields.io/badge/initial%20payload-72%20kB%20gzip-blue)](#performance)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> One year of a stranger's digital life — music, movies, places, purchases, photos,
> messages, searches, events and notes — decoded into 8 narrative chapters, a
> searchable archive, a connection engine that finds the threads between records,
> and an insight layer that measures the year that no single receipt admits.

**Table of contents**

- [What it is](#what-it-is)
- [The story hiding in the data](#the-story-hiding-in-the-data)
- [Features](#features)
- [Quick start](#quick-start)
- [Deep links (URL state)](#deep-links-url-state)
- [Architecture at a glance](#architecture-at-a-glance)
- [Quality gates](#quality-gates)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Responsive design](#responsive-design)
- [Documentation index](#documentation-index)
- [Dataset & swap-in contract](#dataset--swap-in-contract)
- [Deploy](#deploy)
- [Browser support](#browser-support)

---

## What it is

A static, zero-backend React application. The dataset ships inside the bundle, so
the first paint *is* the data: filtering, relationship scoring, statistics and
story grouping all run in the browser, in milliseconds, with no network calls.

- **163 receipts** · **9 categories** · **8 chapters** · **100% connected** (every receipt has at least 3 threads)
- **4 views**: Cover → The Story → Explorer → Patterns
- **3 engines**: connection (`lib/links.js`), insight (`lib/insights.js`), query (`lib/filters.js`)
- **No UI kit, no chart library, no CSS framework** — charts are hand-rolled SVG/CSS

## The story hiding in the data

| Chapter | Arc | What the receipts reveal |
|---|---|---|
| 01 · The Quiet After | Jan–Feb | heartbreak, 2 AM playlists, ice cream for one |
| 02 · Small Rebellions | Feb–Apr | gym → sunrise runs → first 5K |
| 03 · The Interview Gauntlet | Apr–May | 14 cold brews, 2 interviews, an offer letter |
| 04 · Salt Air & Scooters | Jun | Goa with the group chat |
| 05 · New City, New Frequency | Jul | Bangalore, empty room, new job |
| 06 · Two Straws, One Milkshake | Aug–Sep | meeting Meera |
| 07 · Six Strings | Sep–Nov | guitar, barre chords, one full song |
| 08 · The Long Way Home | Nov–Dec | Diwali at home, year-end reflection |

The meta-arc: **heartbreak → habits → ambition → escape → roots → love → craft → home.**

## Features

- **Cover** — a decoding terminal that "unrolls" the archive (skipped entirely for reduced-motion users).
- **The Story** — 8 chapters, each receipt printed as a thermal receipt card, with per-chapter preview + expand.
- **◉ Connection Lens** — hover **or focus** any receipt; related receipts glow, the rest fade. Keyboard users get the same feature.
- **Receipt threads** — every card opens a modal that explains *why* it connects: `same day`, `same place`, `theme: fitness`, `same week`, `near in time`.
- **Explorer** — full-text search (all words must match, across title + every meta field + tags), 9 category chips with counts, month scrubber, sort toggle, clear-all, copy-view-link, progressive rendering.
- **Patterns** — 2 AM Index, ledger, top places/artists/contacts, spending bars, mood arc, hour heat-strip, weekday + streak analysis, curiosity log, and a published connection-engine report.
- **Deep-linkable everything** — filters live in the URL, browser back/forward works.
- **Dark + light theme**, print stylesheet, forced-colors support, reduced-motion, reduced-data and high-contrast modes.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/ (deployable to any static host)
npm run preview    # serve the production build locally
```

Every script:

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build (code-split, minified, hashed) |
| `npm run preview` | Serves `dist/` |
| `npm test` | Vitest: unit + component/integration suites (99 tests) |
| `npm run test:coverage` | Same, with a v8 coverage report + thresholds |
| `npm run lint` | ESLint 9 flat config, **zero warnings tolerated** |
| `npm run format` / `format:check` | Prettier write / verify |
| `npm run smoke` | Headless dataset-integrity checks (11 checks, exits non-zero on failure) |
| `npm run data` | Regenerates the fictional dataset |
| `npm run verify` | lint → test → smoke → build (exactly what CI runs) |

## Deep links (URL state)

Route state lives in `location.hash`, so every view is shareable and bookmarkable:

```
#/story                      The Story
#/explore                    all 163 receipts
#/explore?q=goa&month=6       6 Goa hits
#/explore?q=cubbon&type=place,photo&sort=desc
#/insights                   computed Patterns
```

An empty hash is deliberate: it means "cold entry" and opens the Cover, so a first-time
visitor gets the decoding sequence while a shared link goes straight to its target.

## Architecture at a glance

```
URL hash ─┐
          ├─► useHashRoute ─┐
localStorage (lens) ────────┤
          ├─► archiveReducer┴─► ArchiveProvider ─► useArchive() ─► views
          │                        │
          │                        └─► archiveService (validate → link map → insights, once)
          └─ telemetry / web-vitals
```

Layers, dependency rules and the reasoning behind each choice: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Quality gates

CI (`.github/workflows/ci.yml`, Node 20 + 22) runs, in order: `lint` → `format:check` →
`test:coverage` → `smoke` → `build`, and uploads `dist/` as an artifact.

| Gate | Command | Current result |
|---|---|---|
| Lint | `npm run lint` | 0 errors, 0 warnings (ESLint 9 flat config + react-hooks) |
| Formatting | `npm run format:check` | all files match Prettier |
| Tests | `npm test` | **99 passing / 11 files** |
| Coverage | `npm run test:coverage` | **93.3% statements · 84.5% branches · 84.3% functions** (thresholds 70/65/70) |
| Dataset integrity | `npm run smoke` | **11/11 checks** — 163 receipts, 9 categories, all arcs mapped, chronological, 163/163 connected, ≥3 links each |
| Build | `npm run build` | 80 modules → 8 chunks, no warnings |

Suites cover pure logic (`links`, `insights`, `filters`, `validate`, `url`, `format`,
`reducer`, `service`, `telemetry`), component/integration (`app.test.jsx`) and an
accessibility contract (`accessibility.test.jsx`). Details:
**[docs/TESTING.md](docs/TESTING.md)**.

## Performance

Measured on the current build (Vite 5, gzip):

| Chunk | Raw | Gzip | When it loads |
|---|---|---|---|
| `index.html` | 1.3 kB | 0.7 kB | always |
| CSS (single file) | 21.2 kB | 5.5 kB | always |
| `vendor-react` | 140.8 kB | 45.3 kB | always (cacheable) |
| `index` (shell + store + engines) | 35.4 kB | 13.8 kB | always |
| `data-archive` (dataset) | 26.0 kB | 7.5 kB | always |
| `StoryView` | 3.2 kB | 1.4 kB | on first view |
| `Explorer` | 4.9 kB | 2.2 kB | on navigation |
| `Insights` | 7.7 kB | 2.8 kB | on navigation |
| **Initial payload** | — | **≈ 72 kB** | first paint |

Techniques: route-level `React.lazy` + Suspense, `manualChunks` (vendor / data / views),
`React.memo` on cards and chapters, a pre-computed search index instead of per-keystroke
filtering, single-pass insight computation, progressive grid rendering via
`IntersectionObserver`, preconnect + non-blocking font loading, an animation-free
reduced-motion path, and Core Web Vitals measured in-app (`src/lib/perf.js`).
Budgets and re-measurement steps: **[docs/PERFORMANCE.md](docs/PERFORMANCE.md)**.

## Accessibility

Built against **WCAG 2.2 AA** and verified by an automated suite, not by intention:

- Every control is a real `<button>`/`<a>`; nav items are links so they can be copied or opened in a new tab.
- Modal: `role="dialog"` + `aria-modal` + `aria-labelledby`, focus moves in, **Tab is trapped**, Escape closes, focus returns to the opening card, background scroll is locked (reference-counted).
- Skip link, one `<h1>` per view, labelled landmarks, `aria-current="page"` on the active nav item.
- One `role="status"` announcer reports view changes and result counts; the result counter is its own live region.
- Charts carry text alternatives: SVG `role="img"` with generated labels plus visually hidden data lists.
- `aria-pressed` on toggles and filters; `aria-expanded`/`aria-controls` on disclosures.
- Honours `prefers-reduced-motion`, `prefers-contrast: more`, `prefers-reduced-data`, `forced-colors` and colour scheme.
- Touch targets ≥ 44 px on coarse pointers.

Checklist with code pointers: **[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)**.

## Responsive design

Fluid-first (`clamp()`, `auto-fit`/`minmax`, container queries) with a documented breakpoint
ladder at **320 / 360 / 480 / 560 / 720 / 900 / 1200 / 1600 px**, plus landscape-phone,
ultra-wide, tablet-portrait and high-DPI handling, safe-area insets, a collapsing nav
disclosure below 560 px, and a print stylesheet that paginates per chapter.

## Documentation index

| Document | Purpose |
|---|---|
| [`BLUEPRINT.md`](BLUEPRINT.md) | Requirement → evidence map with an honest self-audit (including what is *not* done) |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Layers, data flow, dependency rules, folder map |
| [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) | Receipt schema, validation rules, swap-in contract |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) | WCAG 2.2 AA checklist, keyboard map, verification |
| [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) | Budgets, measurements, CWV instrumentation, re-measurement steps |
| [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) | Breakpoint ladder, container queries, input-modality rules |
| [`docs/TESTING.md`](docs/TESTING.md) | Test strategy, suites, coverage policy, CI gates |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens, type scale, contrast table, motion rules |
| [`docs/adr/`](docs/adr) | Architecture decision records (hash routing, JSDoc types, URL-owned state …) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Local workflow, conventions, PR checklist |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history (Keep a Changelog format) |

## Dataset & swap-in contract

No official dataset file was provided at build time, so `src/data/dataset.json` is a
**fictional dataset generated by `scripts/generate-data.mjs`**, with story arcs and shared
days/places/themes deliberately planted so the connection engine surfaces real
relationships (100% of receipts are connected, ≥3 threads each).

If the official dataset arrives, drop it in as the same shape — validation, the connection
engine, the insight engine and the UI all keep working unchanged. The contract lives in
[`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) and is **enforced at boot** by
`src/lib/validate.js`: a malformed dataset produces a readable error instead of rendering
`undefined` 163 times.

Verify any swap-in with:

```bash
npm run smoke        # schema, categories, arcs, chronology, connectivity, search
npm test             # engine behaviour against fixtures
```

## Deploy

`npm run build`, then drag `dist/` into Netlify Drop, or point Vercel / GitHub Pages at the
repo. `base: './'` means the build works from any sub-path (including project GitHub Pages
sites). No server, no environment variables, no runtime configuration.

GitHub Pages, from scratch:

```bash
npm run build
git subtree push --prefix dist origin gh-pages   # or use the Actions workflow
```

## Browser support

| Engine | Version | Notes |
|---|---|---|
| Chrome / Edge | last 2 | baseline for the `es2020` build target |
| Firefox | last 2 | — |
| Safari | 15.4+ | container queries, `dvh`, `:focus-visible` |
| Chrome Android / iOS Safari | last 2 | touch rules via `hover: none` / `pointer: coarse` |

Older engines **degrade instead of breaking**: no `IntersectionObserver` ⇒ grids render in
full; no `PerformanceObserver` ⇒ metrics are skipped; no `navigator.clipboard` ⇒ the
copy-link button announces the failure and the address bar still works.

## License

[MIT](LICENSE) — the dataset is fictional; treat the story as a demo artefact.
