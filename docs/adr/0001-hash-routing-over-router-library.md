# ADR 0001 — Hash routing instead of a router dependency

**Status:** accepted · **Date:** 2025-09-20

## Context

The archive has four screens (Cover, Story, Explorer, Patterns) and a handful of filter
parameters (query, categories, month, sort). A judged requirement is "meaningful filtering,
searching or navigation" — and a common criticism of single-page demos is that their state
cannot be shared or revisited. We also want back/forward to work, and we want to keep the
dependency list to `react` + `react-dom`.

## Decision

Implement routing as a ~40-line hook, `src/hooks/useHashRoute.js`, that binds React state to
`location.hash`, plus pure serialisation in `src/lib/url.js`:

```
#/explore?q=goa&type=photo&month=6&sort=desc
```

- An **empty** hash is meaningful: it means "cold entry", which opens the Cover so a
  first-time visitor sees the decoding sequence. Shared links go straight to their target.
- Filter updates use `history.replaceState`, so Back returns to the previous *view* rather
  than walking through every keystroke of a search.
- View changes use `pushState`, so Back is a real navigation.
- Unknown routes/params fall back to defaults instead of rendering an empty page.

## Consequences

**Good:** zero dependencies; every filtered view is shareable and bookmarkable; Back/forward
work; the URL format is documented and testable in isolation (`tests/url.test.js` simply
feeds strings to `parseHash`); `useDocumentTitle` makes history entries readable.

**Bad / accepted:** the hash is invisible to servers, so this is not SSR-friendly and gives no
real 404s. Vanity URLs are uglier than path routing. If the project ever needed server-side
routing or nested layouts, this would be the first thing to replace.

## Alternatives rejected

- **React Router** — a large dependency for four routes; would still need custom logic for
  "empty hash means Cover".
- **Path routing with the History API** — requires server rewrites for every deploy target
  (Netlify/Vercel/GitHub Pages/file://), which conflicts with "drag `dist/` anywhere".
- **No URL state at all** (component state only) — loses shareability, Back button and
  deep links; explicitly the weakest point of the pre-refactor version.