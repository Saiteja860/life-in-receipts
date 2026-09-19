# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2025-09-20

The "quality engine" pass: the same product, rebuilt so every claim about it is
verifiable by running a command.

### Added

- **Test suite (99 tests, 11 files)** with Vitest + Testing Library +
  `jest-dom`: pure-logic suites for the connection, insight, query, validation,
  URL and reducer engines, an application flow suite (`tests/app.test.jsx`), and
  an accessibility contract suite (`tests/accessibility.test.jsx`).
- **Coverage gate** (`npm run test:coverage`) with v8 thresholds at 70/65/70;
  the build currently reports **93.3% statements / 84.5% branches**.
- **ESLint 9 flat config** (react, react-hooks, `--max-warnings 0`) and
  **Prettier** with `.editorconfig`; `npm run format:check` is part of CI.
- **CI workflow** (`.github/workflows/ci.yml`, Node 20 + 22): lint → format →
  coverage → smoke → build, uploading `dist/` as an artifact.
- **URL state / deep links** via a 40-line hash router (`src/hooks/useHashRoute.js`):
  `#/explore?q=goa&type=photo&month=6&sort=desc`, with working back/forward, plus a
  "copy view link" action.
- **Architecture layers**: `constants/`, `types/` (JSDoc typedefs + `jsconfig.json`),
  `hooks/` (10 hooks incl. `useFocusTrap`, `useIncrementalReveal`, `useMediaQuery`),
  `context/` (provider + pure reducer + selectors), `services/` (archiveService,
  telemetry), `utils/`, `styles/`, and `lib/perf.js` (Core Web Vitals observer).
- **Boot-time dataset validation** (`src/lib/validate.js`): structure, ids, timestamps,
  category coverage, arc mapping and chronology — malformed data fails loudly instead of
  rendering `undefined`.
- **ErrorBoundary** with a reload recovery path and error telemetry.
- **Accessibility work**: focus trap (`Tab`/`Shift+Tab`) + focus restore in the modal,
  reference-counted scroll lock, a `role="status"` announcer for view changes and result
  counts, `aria-pressed`/`aria-expanded`/`aria-controls` on all toggles and disclosures,
  `aria-valuetext` on the month scrubber, text alternatives for every chart, and a
  reduced-motion path that skips the cover's decoding animation.
- **Responsive overhaul**: fluid `clamp()` type scale, container queries on chapters,
  breakpoint ladder 320→1600 px, landscape-phone and tablet-portrait handling, safe-area
  insets, WCAG 2.2 44 px touch targets on coarse pointers, `prefers-contrast: more`,
  `prefers-reduced-data` and `forced-colors` support, plus an adaptive **light theme**.
- **Print stylesheet** (`src/styles/print.css`): chapter-per-page pagination, flattened
  colours, no interactive chrome.
- **Performance**: route-level `React.lazy` + Suspense (view chunks of 1.4/2.2/2.8 kB gz),
  `manualChunks` for vendor/data/views, pre-computed search index, single-pass insight
  computation, `React.memo` on cards and chapters, progressive grid rendering.
- **Docs**: `docs/ARCHITECTURE.md`, `DATA_SCHEMA.md`, `ACCESSIBILITY.md`,
  `PERFORMANCE.md`, `RESPONSIVE.md`, `TESTING.md`, `DESIGN_SYSTEM.md`,
  `docs/adr/` decision records, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`.
- **`npm run smoke`** expanded from 4 printed facts to 11 pass/fail dataset checks that
  exit non-zero, executed through `vite-node` so `@/…` aliases resolve as in the app.
- **Connection engine upgrade**: added `same week` scoring, and every receipt is now
  guaranteed ≥3 threads (nearest-in-time fallback) — connectivity is 163/163 at 100%,
  published on screen in Patterns and in the footer.

### Changed

- `src/App.jsx` reduced to composition only (~70 lines): views read from `useArchive()`
  instead of receiving props.
- Components reorganised: added `TopNav`, `Chapter`, `ReceiptRows`, `AppFooter`,
  `Announcer`, `ViewLoading`, `ErrorBoundary` and `components/insights/*`
  (`StatCard`, `BarMeter`, `MonthBars`, `MoodArc`, `HourHeatStrip`, `CuriosityLog`).
- Insights view is now built from sub-components and reports busiest/quietest month,
  weekday, streak and connection-engine statistics.
- Styles split into `styles.css` (tokens + base), `styles/components.css`,
  `styles/responsive.css` (all adaptive rules in one file), `styles/print.css`.
- On touch devices the Connection Lens no longer depends on hover — focus drives it, and
  card tilt is removed where it would hurt tap accuracy.
- Version bumped to 1.1.0; `engines.node >= 20`.

### Fixed

- Filter-clearing race: a debounced search could re-apply a stale query after "clear
  filters"; the Explorer now tracks the last value it actually pushed to the URL.
- Modal no longer leaks scroll lock when reopened repeatedly (reference-counted).
- Card/lens hover state on touch devices (`hover: none` handling) — previously the lens
  faded cards with no way to inspect them.
- `topPlaces`/`topArtists`/`topContacts` ordering is now deterministic (count, then name),
  so charts never reshuffle between identical renders.
- Timestamps are parsed uniformly (`Date.parse` on ISO strings) instead of mixed
  `slice`/`Date` handling, removing an off-by-one risk around midnight.

## [1.0.0] — 2025-09-19

### Added

- Initial archive: 163 fictional receipts across 9 categories, 8 curated chapters,
  Cover → Story → Explorer → Patterns flow.
- Connection Lens, per-receipt thread modal, full-text search with category chips, month
  scrubber and sort, hand-rolled SVG/CSS insight charts, responsive layout to 360 px.
- `scripts/generate-data.mjs` (reproducible dataset) and the original printed smoke test.

[1.1.0]: https://github.com/Saiteja860/life-in-receipts/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Saiteja860/life-in-receipts/releases/tag/v1.0.0