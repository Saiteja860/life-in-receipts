# ADR 0003 — The URL owns view and filter state; the reducer owns everything transient

**Status:** accepted · **Date:** 2025-09-20

## Context

The archive has two clearly different kinds of state, and mixing them caused the pre-refactor
version's biggest weaknesses (unshareable filtered views, a Back button that left the app, no
deep links):

1. **Durable / describable state** — which view is open and how the Explorer is filtered.
   A user can meaningfully want to share, bookmark or return to this.
2. **Transient interaction state** — Connection Lens on/off, which receipt is hovered, which
   receipt is open in the modal, which chapters are expanded past their preview. Nobody shares
   a hover.

## Decision

Split them by lifetime, with no overlap:

| State | Owner | Persistence |
|---|---|---|
| View + filters (query, types, month, sort) | `location.hash` via `useHashRoute` | shareable, bookmarkable, Back/forward |
| Lens toggle | `localStorage` (`lir:lens`), read once at boot | survives reload (a stated preference) |
| Hovered / selected / expanded chapters | `archiveReducer` (`useReducer` in the provider) | session only; reset on view change where sensible |

Consequences of the split are enforced mechanically: components never call `useState` for route
or filter data, and `archiveReducer` is a pure function with a test file that asserts identity
preservation (returning the *same object* when nothing changes, so no wasted renders) and that
unknown actions are no-ops (a stray dispatch can never blank the archive).

Derived data (visible receipts, chapters with items, the selected receipt, its links, the search
index) is computed once in the provider with `useMemo` and exposed through `useArchive()`, so
views are presentational and no component recomputes a filter.

## Consequences

**Good:** shareable deep links; a Back button that behaves; one testable transition table for UI
state (`tests/reducer.test.js`, 9 cases); derived data computed once regardless of how many
components read it; views with zero data logic.

**Bad / accepted:** two sources of truth to reason about, and the Explorer needs a small bridge
between them — a local debounced input draft plus a `pushedQuery` ref, so a stale debounce tick
cannot re-apply a query after the user pressed "clear filters". That bridge is exactly one
`useRef` and two `useEffect`s, documented inline; the alternative (making the input uncontrolled
by the URL) loses back/forward for searches.

## Alternatives rejected

- **Everything in `useState` in `App`** — the pre-refactor design: no shareability, no Back,
  prop drilling into every view.
- **Everything in one reducer (route included)** — then the URL becomes a mirror of the store
  and must be kept in sync by hand in both directions, which is precisely where echo/loop bugs
  come from.
- **Everything in the URL** (hover, modal, expansions) — `replaceState` per hover would fight the
  browser history and make the URL unreadable.
- **A state library** (Redux/Zustand) — unnecessary for one store with one consumer tree and no
  async writes; the reducer plus context is ~150 lines with no dependency.