# ADR 0002 — JSDoc typedefs instead of TypeScript

**Status:** accepted · **Date:** 2025-09-20

## Context

The dataset has a real schema (9 categories, arcs, timestamps, a free-form `meta` block), the
engines exchange structured objects (`Link`, `Insights`, `ArchiveBundle`), and the store exposes
a wide API surface (`ArchiveStore`). Untyped, this is easy to misuse — e.g. rendering
`undefined` for a misspelled meta key, or passing the wrong shape between `lib/` and a view.

Options were: adopt TypeScript, adopt PropTypes, or document types without a build step.

## Decision

Document types in `src/types/index.js` as JSDoc `@typedef`s, reference them from every module
(`@param {import('@/types').Receipt[]}`), and add `jsconfig.json` with `checkJs: false` and the
`@/*` path mapping so editors resolve the alias and offer completion.

Runtime prop validation is switched **off** (`react/prop-types: off` in ESLint) because the
JSDoc types are the single source of truth.

## Consequences

**Good:** full editor completion and hover documentation with no compiler, no `.ts` migration,
no type-check step in CI, and no build-tool coupling. The typedefs double as the schema
documentation referenced by `docs/DATA_SCHEMA.md`. Runtime code stays plain ES modules, which
keeps the Vitest setup trivial.

**Bad / accepted:** types are not *enforced* — a mistake only shows up in the editor, not as a
build failure. `checkJs` is off, so the compiler does not verify the annotations either.
Numeric/string mistakes in `meta` access are still possible at runtime, which is why the schema
is additionally validated at boot (`src/lib/validate.js`) rather than trusted.

## Alternatives rejected

- **TypeScript** — adds a compiler, a config surface, `.ts/.tsx` conventions and a CI type-check
  gate to a project whose entire runtime is ~2 500 lines of component and engine code. The
  cost/benefit did not justify it for a static archive that already validates its own data.
- **`prop-types`** — duplicates every type as a runtime string table, ships validation code in
  the bundle, and was removed from the React 19 direction of travel.
- **No types at all** — the pre-refactor state; the reason several `meta` keys were rendered by
  ad-hoc `&&` chains in two different components with drifting formatting.