# Architecture

## The one-paragraph version

A static React application with no backend. The dataset is bundled, validated once at
boot, and turned into three derived structures (link map, insights, search index) that are
memoised for the page's lifetime. Views are lazy-loaded and read everything from a single
store. Route state lives in the URL hash; transient interaction state lives in a pure
reducer. That is the whole system.

## Layers and dependency direction

```
   App / views ───►  context/   (provider, reducer, selectors)
                        │
   hooks/ (platform) ───┤
   services/ (I-O) ──────┤
                        ▼
              lib/   (pure engines — no React, no DOM)
                        │
              utils/ (format, dom helpers)
                        │
        constants/ · types/ · data/   (leaves)
```

**Rule: dependencies only point downwards.** `lib/` never imports React or a component;
`utils/` never imports from `lib/`; components read the store and nothing else. The payoff
is that every engine in `lib/` is testable in plain Node — which is why 9 of the 11 test
files need no DOM.

## Folder map

```
src/
├─ constants/index.js      Every shared literal: views, weights, limits, storage keys.
├─ types/index.js          JSDoc typedefs (Receipt, Link, Insights, ArchiveStore…).
├─ data/
│  ├─ dataset.json         The 163 receipts (generated).
│  └─ chapters.js          Narrative layer: 8 chapters + 9 type descriptors.
├─ lib/                    Pure logic — what would survive a UI rewrite.
│  ├─ links.js             Connection engine (6 signals + nearest-in-time fallback).
│  ├─ insights.js          Statistics engine (single pass over the dataset).
│  ├─ filters.js           Query engine (pre-built search index, sort, grouping).
│  ├─ validate.js          Dataset guard rail, run at boot.
│  ├─ url.js               Hash ⇄ view + filter serialisation.
│  └─ perf.js              Core Web Vitals via PerformanceObserver.
├─ services/
│  ├─ archiveService.js    The only module that knows where data comes from.
│  └─ telemetry.js         One instrumentation seam (dev log / opt-in beacon).
├─ hooks/                  10 hooks: routing, focus trap, media queries, reveal, etc.
├─ context/
│  ├─ ArchiveProvider.jsx  Loads data, owns URL + reducer, memoises derived views.
│  ├─ archiveReducer.js    Pure UI-state transitions + selectors.
│  └─ useArchive.js        Consumer hooks (useArchive / useRoute / useConnections).
├─ components/             Presentation only; each file owns one idea.
│  └─ insights/            Chart primitives, each with a text alternative.
├─ styles/
│  ├─ styles.css           Tokens, base, original component rules.
│  ├─ components.css       Rules for components added in the refactor.
│  ├─ responsive.css       ALL media + container queries (one auditable file).
│  └─ print.css            Print/pagination.
├─ App.jsx                 Composition only (~70 lines).
└─ main.jsx                Root render, providers, stylesheet order, web-vitals start.
```

## Data flow

```
  validation ─┐
              ├─► linkMap       (163 × 163 scoring, once)
  buildLinkMap┤
              ├─► insights      (single pass)
              └─► searchIndex   (lowercased haystack per receipt, once)
                       │
  URL hash ────────────┼─► route.filters ──► filterReceipts ──► visibleReceipts
                       │
  reducer ─────────────┴─► lensOn / hoveredId / selectedId / expandedChapters
                       │
                       └─► ArchiveProvider value ──► useArchive() ──► views
```

Nothing recomputes per keystroke: the search index is built once, filtering is a linear
scan over 163 items, and the lens performs O(1) lookups into the pre-built link map.

`loadArchive()` is idempotent and memoised — calling it from ten components still runs
validation, link building and insights exactly once. `resetArchiveCache()` exists for tests.

## Why these choices

| Decision | Alternative rejected | Reason |
|---|---|---|
| Hash router (40 lines) | React Router | Four routes; shareable filtered views; back/forward works; zero dependency |
| JSDoc typedefs + `jsconfig.json` | TypeScript | Editor completion and documented types with no build step and no migration |
| URL owns view + filter state | `useState` in App | Shareable links, working Back button, history entries that describe what was seen |
| Pure reducer for UI state | Many `useState`s | One testable transition table; identity preserved when nothing changes |
| Pre-computed search index | Filter inside the component | Removes ~9 field reads × 163 receipts from every keystroke |
| Lazy views | One bundle | Story-only visitors never download the Explorer or the charts |
| Plain CSS in four files | CSS-in-JS / Tailwind | No plugin, no runtime cost, all responsive rules auditable in one file |
| Hand-rolled SVG/CSS charts | Chart library | 7.7 kB gz for the whole Patterns view vs. a library's baseline |
| Deterministic id-hash tilt | `Math.random()` | Identical layout on every render and device — no jitter |
| Reference-counted scroll lock | Toggle `overflow` on open | Nested overlays cannot unlock each other's scroll |

## Failure handling

| Failure | Response |
|---|---|
| Malformed dataset | `validate.js` reports it, a warning is logged, valid receipts still render; `npm run smoke` exits non-zero |
| Render exception | `ErrorBoundary` shows a readable message + reload, and reports via telemetry |
| No `IntersectionObserver` | Grids render in full (feature detect, not polyfill) |
| Denied clipboard / storage | Announced; degrades to the address bar / in-memory state |
| Unknown reducer action | Ignored — never blanks the archive |
| Unknown route or receipt id | Falls back to the default view / renders nothing |

## Extension points

- **Swap the dataset** → replace `src/data/dataset.json` ([DATA_SCHEMA.md](DATA_SCHEMA.md)).
- **Add a category** → add to `RECEIPT_TYPES` + `TYPE_META`; chips, inks and charts follow.
- **Add a view** → add to `VIEWS` + `NAV_ITEMS`, lazy-import in `App.jsx`, add a title/announcement in the provider.
- **Add a relationship signal** → add a weight to `LINK_WEIGHTS` and a branch in `scorePair`; the lens, the modal and the published engine report all pick it up automatically.