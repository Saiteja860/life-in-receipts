# Contributing

Thanks for looking under the hood. This project is deliberately small and
dependency-light; the goal of every rule below is that **a reviewer can verify any
claim by running one command**.

## Local workflow

```bash
npm install
npm run dev              # http://localhost:5173

npm run verify           # what CI runs: lint → test → smoke → build
```

Individual gates while you work:

```bash
npm run lint             # ESLint, zero warnings tolerated
npm run format           # Prettier write (format:check in CI)
npm test                 # Vitest watch-free run (99 tests)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # coverage report + thresholds
npm run smoke            # headless dataset integrity checks
npm run build            # production build
```

## Conventions

**Architecture** — dependencies flow one way only:

```
constants → utils → lib → services → hooks → context → components → App
```

Nothing in `lib/` may import React or a component. Nothing in `utils/` may import
from `lib/`. If you need to break this, that is a signal to add a layer, not a shortcut.
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

**Imports** — use the `@/` alias (`@/lib/links.js`), never `../../`, except for
sibling files inside the same folder (`./ReceiptRows.jsx`).

**No magic values** — numbers, labels, storage keys and route ids live in
`src/constants/index.js`. If you find yourself typing a literal that another file
also knows, add it to constants.

**State** — route state (view + filters) belongs in the URL; transient interaction
state (lens, hover, open modal, expanded chapters) belongs in the reducer. Do not put
either in component state. See [`docs/adr/0003-url-owns-view-and-filter-state.md`](docs/adr/0003-url-owns-view-and-filter-state.md).

**Components** — presentational: read from `useArchive()`, render, done. Derived data
is computed once in the provider with `useMemo`, never inline per render.

**Styling** — plain CSS, split by concern (`styles.css` tokens/base,
`styles/components.css`, `styles/responsive.css`, `styles/print.css`). All adaptive
rules (media + container queries) go in `responsive.css` so the responsive surface is
auditable in one file. New visual values become CSS custom properties in `:root`,
not hard-coded colours.

**Accessibility is not optional** — every interactive element must be a real
`<button>`/`<a>` with an accessible name; toggles need `aria-pressed`, disclosures need
`aria-expanded` + `aria-controls`; anything visual needs a text alternative. There is a
test suite that fails if a control is unnamed.

**Comments explain *why*** — the code already says *what*. A good comment states the
tradeoff, the bug it prevents, or the measurement that justified it.

## Adding a feature — the checklist

1. **Data/logic first.** Put pure logic in `src/lib/` and unit-test it in `tests/`.
   If it cannot be tested without React, it is in the wrong layer.
2. **Constants.** Add any shared literal to `src/constants/index.js`.
3. **Store.** If the feature has state, add an action to `archiveReducer.js` and expose
   it through `ArchiveProvider`. Unknown actions must stay no-ops.
4. **Component.** Build it from the existing primitives (`ReceiptCard`, `insights/*`).
5. **Responsive.** Prove it at 320, 360, 560, 720, 1200 and 1600 px; check landscape
   phone and touch (`hover: none`).
6. **Accessibility.** Keyboard-only pass: Tab through, Enter/Space activate, Escape
   closes, focus visible, focus restored, live region announces the change.
7. **Docs.** Update `README.md` if the feature is user-visible, `BLUEPRINT.md` if it maps
   to a judged requirement, and `CHANGELOG.md` under `Unreleased`.

## Pull request checklist

- [ ] `npm run verify` passes locally (lint → test → smoke → build)
- [ ] New logic has tests; coverage thresholds still met
- [ ] `npm run format:check` clean
- [ ] Keyboard + screen-reader pass on any new interaction
- [ ] Checked at 320 px and 1600 px; touch pass for hover-dependent UI
- [ ] No new runtime dependency without a note in the PR explaining the tradeoff
- [ ] `CHANGELOG.md` updated

## Commit style

Conventional Commits, imperative mood, one logical change per commit:

```
feat: add month scrubber keyboard stepping
fix: stop stale debounced query overriding a cleared filter
docs: document the dataset swap-in contract
test: cover nearest-in-time link fallback
refactor: move insight charts into components/insights
perf: pre-compute the search index once per dataset
```

## Reporting a bug

Include: what you expected, what happened, the exact steps, viewport size, browser, and
whether it reproduces with `prefers-reduced-motion: reduce`. For dataset issues, paste the
output of `npm run smoke`.