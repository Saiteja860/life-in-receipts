# ADR 0004 — Four plain CSS files instead of CSS-in-JS or a utility framework

**Status:** accepted · **Date:** 2025-09-20

## Context

The visual language is unusual and central to the concept: cream receipt paper, monospace ink,
dashed dividers, a CSS barcode, a jagged `clip-path` tear-off edge, per-chapter accent colours,
a deterministic per-card tilt, plus a large amount of *adaptive* styling (breakpoints, container
queries, input modality, print, five user-preference queries).

Options were: CSS Modules, CSS-in-JS (styled-components/Emotion), Tailwind, or plain CSS.

## Decision

Four plain CSS files, imported in a deliberate order from `src/main.jsx`:

| File | Owns |
|---|---|
| `styles.css` | Tokens (`:root`), base element styles, layout and the original component rules |
| `components.css` | Rules for components added in the refactor |
| `responsive.css` | **Every** media and container query, in six labelled sections |
| `print.css` | Print flattening and pagination |

Theming goes through CSS custom properties only. Per-receipt and per-chapter colours are set as
inline custom properties from data (`--ink`, `--chapter`) — the JS layer never hard-codes a
colour. Selector names are class-based and component-scoped by convention (`rc-*` receipt card,
`ex-*` explorer, `ins-*` insights, `chapter-*`).

## Consequences

**Good:** zero build plugin and zero runtime cost (the CSS is extracted, minified and hashed by
Vite — 5.5 kB gz for everything). All adaptive rules are auditable in one read, which is what
makes the responsive surface defensible. Preference queries compose naturally across files.
Diagnosing a layout issue is a devtools problem, not a "find the styled-component" problem.

**Bad / accepted:** no automatic scoping, so class-name discipline is a human convention rather
than a guarantee; there is no lint rule preventing a name collision. Two files hold component
rules (the split is historical: `components.css` exists because the refactor added markup after
`styles.css` was already written), which is a small extra place to look. Dead CSS is not detected.

## Alternatives rejected

- **CSS-in-JS** — adds a runtime (or a compile step) to a site whose entire JS payload is 72 kB
  gz; and it makes `prefers-*`/`@container`/`@media print` blocks harder to review in one place.
- **Tailwind** — would put breakpoint and preference logic inline in JSX, spread across a dozen
  components, defeating the "audit the responsive surface in one file" goal, and the concept's
  bespoke visuals (barcode gradient, tear-off `clip-path`, tilt) would each need custom CSS anyway.
- **CSS Modules** — solves a collision problem this project does not have, at the cost of a
  hash-scrambled stylesheet and less readable devtools output.
- **Sass** — the only features we would use (nesting, variables) are native now (`:root`
  custom properties, and nesting via modern CSS), so the toolchain would exist for syntax sugar.