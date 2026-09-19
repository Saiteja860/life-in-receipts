# Testing

## Philosophy

Three questions, three kinds of test:

1. **Does the logic do what it claims?** → pure unit tests over `src/lib`, `src/utils`, `src/context/archiveReducer.js`. No DOM, fast, exhaustive over edge cases.
2. **Does the app actually work end to end?** → one integration suite that drives the real tree (`ErrorBoundary → ArchiveProvider → App`) with `user-event`, exactly as a visitor would.
3. **Is the accessibility contract real?** → a dedicated suite that asserts roles, names, focus management and live regions, so a11y regressions fail CI instead of being noticed by a human later.

Plus one non-mocked layer: `npm run smoke` validates the **shipped dataset** with the same
modules the app uses.

## Suites

| File | Kind | Covers |
|---|---|---|
| `tests/links.test.js` | unit | Scoring per signal, reason strings, self-exclusion, min/max link guarantees, nearest-in-time fallback, no-meta resilience |
| `tests/insights.test.js` | unit | Totals, 12-slot series, hour/weekday bins, busiest day, streak, mood fallback to chapters, empty dataset |
| `tests/filters.test.js` | unit | Multi-word queries, category + month + query composition, sort direction, immutability, grouping, filter counting |
| `tests/validate.test.js` | unit | Every error and warning path incl. non-array payload, bad ids/timestamps, duplicates, orphan arcs |
| `tests/url.test.js` | unit | Hash round-trips, default omission, invalid month/sort/route rejection, filter equality |
| `tests/format.test.js` | unit | Currency/locale grouping, NaN safety, percentages, clamping, pluralisation |
| `tests/reducer.test.js` | unit | Every action, identity preservation, chapter expand/fold, preview cap, reset, unknown actions |
| `tests/service.test.js` | unit | Boot validation of the real dataset, memoisation, 163/163 connectivity, `MIN_LINKS` |
| `tests/telemetry.test.js` | unit | Sink fan-out, broken-sink isolation, warning/error labelling, CWV rating bands |
| `tests/app.test.jsx` | integration | Cover→Story, deep links, nav + hash sync, debounced search, chip filtering, clear-all, copy link, modal open/Escape, lens toggle, Patterns rendering, footer |
| `tests/accessibility.test.jsx` | integration | Skip link, labelled nav + `aria-current`, single `h1`, named controls, field label/hint wiring, chart alternatives, live regions, focus trap + restore + scroll lock, disclosures, reduced motion, compact nav |

**Current status: 11 files · 99 tests · all passing.** Coverage: **93.3% statements,
84.5% branches, 84.3% functions**.

## Running

```bash
npm test                 # one-shot (CI)
npm run test:watch       # watch mode while developing
npm run test:coverage    # v8 coverage + thresholds (70/65/70) — fails the build if missed
npm test -- links        # single file by name pattern
```

## Test infrastructure

- `tests/setup.js` — `jest-dom` matchers, `cleanup()` between tests, and stubs for the browser APIs jsdom lacks: `matchMedia` (**`mockMatchMedia(predicate)`** lets a test act like a phone / reduced-motion / high-contrast user), `IntersectionObserver`, `ResizeObserver`, `scrollIntoView`, `navigator.clipboard`, plus `localStorage` and history reset per test.
- `tests/utils.jsx` — `renderApp({ hash })`: renders the real provider tree at a given route.
- `tests/fixtures.js` — `makeReceipt()` and `TINY_ARCHIVE`, a 4-receipt archive with *known* relationships (shared day+theme, shared place, deliberately unrelated) so engine assertions are readable and independent of the shipped dataset.

## What is deliberately not tested (and why)

Being explicit beats a vague "good coverage" claim:

| Not tested | Why | Mitigation |
|---|---|---|
| Real browser rendering / visual regression | No Playwright in this project's dependency budget | Documented manual matrix in [RESPONSIVE.md](RESPONSIVE.md); CSS is auditable in one responsive file |
| CSS media-query behaviour | jsdom evaluates no layout | `mockMatchMedia` tests the *JS* branch of each query; the CSS side is spot-checked manually |
| Actual Core Web Vitals numbers in CI | Needs a real browser + throttling | Thresholds are encoded and unit-tested (`rateMetric`); measurement is in-app via `src/lib/perf.js` |
| Lighthouse score | Requires a headless Chrome run | Budgets documented in [PERFORMANCE.md](PERFORMANCE.md) with chunk sizes from the build |
| `src/main.jsx` | Pure wiring (root render + stylesheet order) | Covered indirectly: every test renders `App` inside the same providers |
| `components/index.js` barrels | Re-exports only | — |

## Coverage policy

Thresholds in `vite.config.js` (`statements 70, branches 65, functions 70, lines 70`) fail
`npm run test:coverage` if they slip. Coverage excludes `src/main.jsx`, `src/types/**` and
`src/data/**` (generated data and type-only modules would otherwise distort the number).

Rule of thumb for a PR: **new logic in `src/lib/` or `archiveReducer.js` must arrive with
tests.** UI-only changes should extend `app.test.jsx` or `accessibility.test.jsx` when they
add an interaction.

## CI

`.github/workflows/ci.yml` runs on every push and pull request, on Node 20 **and** 22:

```
npm ci → npm run lint → npm run format:check → npm run test:coverage → npm run smoke → npm run build
```

…then uploads `dist/` as an artefact. Any failing gate fails the check — lint is run with
`--max-warnings 0`, so a warning is as red as an error.