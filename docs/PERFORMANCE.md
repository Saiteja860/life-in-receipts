# Performance

## Measured result (current build)

`npm run build`, Vite 5.4, `es2020` target, gzip:

| Asset | Raw | Gzip | Loaded |
|---|---|---|---|
| `index.html` | 1.3 kB | 0.7 kB | always |
| `assets/index-*.css` (all four stylesheets, bundled) | 21.2 kB | 5.5 kB | always |
| `assets/vendor-react-*.js` | 140.8 kB | 45.3 kB | always |
| `assets/index-*.js` (shell + store + engines) | 35.4 kB | 13.8 kB | always |
| `assets/data-archive-*.js` (the dataset) | 26.0 kB | 7.5 kB | always |
| `assets/StoryView-*.js` | 3.2 kB | 1.4 kB | first view |
| `assets/Explorer-*.js` | 4.9 kB | 2.2 kB | on navigation |
| `assets/Insights-*.js` | 7.7 kB | 2.8 kB | on navigation |
| **Initial JS+CSS payload** | — | **≈ 72 kB** | first paint |

Build report: **80 modules transformed, 8 chunks, 0 warnings, ~0.7 s.**

## Budgets

| Metric | Budget | Rationale |
|---|---|---|
| Initial JS gzip | ≤ 80 kB | Smaller than a typical hero image; React is 45 kB of it and is cached forever |
| CSS gzip | ≤ 10 kB | Single stylesheet, no framework |
| Any lazy chunk gzip | ≤ 10 kB | A view must never be expensive to enter |
| `chunkSizeWarningLimit` | 300 kB (in `vite.config.js`) | A heavy import fails loudly instead of silently |
| Build time | ≤ 5 s | Fast enough for a pre-commit verify |

Exceeding a budget is a build-visible event, not a silent regression: the chunk list prints
on every build and `chunkSizeWarningLimit` is deliberately tight.

## Techniques in use

| Technique | Where | Effect |
|---|---|---|
| Route-level `React.lazy` + `Suspense` | `App.jsx` | Story visitors never download Explorer or the charts |
| `manualChunks` by concern | `vite.config.js` | Editing a view cannot bust the vendor or dataset cache |
| `React.memo` on cards and chapters | `ReceiptCard.jsx`, `Chapter.jsx` | Lens hover re-renders 2 cards, not 163 |
| Pre-computed search index | `lib/filters.js` | Removes ~9 field reads × 163 receipts per keystroke |
| Single-pass insights | `lib/insights.js` | One loop builds every statistic; no repeated `filter()` chains |
| Memoised archive load | `services/archiveService.js` | Validation + link map + insights run exactly once |
| Progressive grid rendering | `hooks/useIncrementalReveal.js` | First 24 cards paint immediately; the rest mount on scroll (feature-detected) |
| Chapter preview + expand | `Chapter.jsx` + `LIMITS.CHAPTER_PREVIEW` | Chapters of 25 receipts don't triple initial DOM |
| Pure CSS/SVG charts | `components/insights/*` | No charting library; 2.8 kB gz for the entire Patterns view |
| Font loading | `index.html` (`preconnect` + `display=swap`) | No text render blocking, no font FOIT |
| Reduced-motion path | `styles/responsive.css` + `Cover.jsx` | Zero animation work for users who ask for it |
| In-app CWV measurement | `lib/perf.js` | Regressions are observable in production without a third-party script |

## Core Web Vitals instrumentation

`src/lib/perf.js` (~60 lines, no dependency) observes:

| Metric | Source | Thresholds (good / needs improvement) |
|---|---|---|
| LCP | `largest-contentful-paint` observer | 2500 ms / 4000 ms |
| INP | worst `event` entry with an `interactionId` | 200 ms / 500 ms |
| CLS | `layout-shift`, excluding `hadRecentInput` | 0.1 / 0.25 |
| FCP | `paint` observer | 1800 ms / 3000 ms |
| TTFB | `navigation` responseStart | 800 ms / 1800 ms |

Ratings are computed by `rateMetric()` (unit-tested in `tests/telemetry.test.js`), values are
flushed on `visibilitychange → hidden` and `pagehide` (the only correct moments — values
still change until then), and every metric goes through the telemetry seam:

- **dev** → `console.debug`, so you see them while you work;
- **production** → silent unless `VITE_TELEMETRY=on`, then `navigator.sendBeacon` (fire and
  forget, never blocks a frame).

The observer stack is registered defensively: no `PerformanceObserver` → no measurement, no
error.

## How to re-measure

```bash
npm run build                     # prints the chunk table above
npm run preview                   # serve dist/ locally
# then, in devtools: Lighthouse → Performance, or watch the [telemetry] console lines in dev
```

For a meaningful LCP, throttle: Network "Slow 4G", CPU 4× slowdown. The layout-shift budget
is the one to watch when touching fonts or the cover, because both affect first paint.

## Known costs (stated honestly)

- **React is 45 kB gz of the 72 kB initial payload.** A hand-written vanilla implementation
  would be smaller; the component model (reducer, memoised derived data, declarative focus
  handling) is what buys the maintainability and the accessibility guarantees.
- **The dataset ships in the initial payload** (7.5 kB gz). It must, because the Story view
  is the first screen after the cover and there is no backend to fetch from.
- **`vendor-react` is a separate chunk** — good for caching, one extra request on a cold
  load.
- **`modulePreload.polyfill` is disabled**, which is correct for modern browsers and would
  matter for very old ones (outside the supported matrix).