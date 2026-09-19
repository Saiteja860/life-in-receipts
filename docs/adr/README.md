# Architecture decision records

Short records of decisions that shaped this codebase, each with the alternatives that were
considered and the trade-offs that were accepted. They are written to be falsifiable: if you
disagree with the *reasoning*, the record says what would have to change for the decision to be
wrong.

| # | Decision | Status |
|---|---|---|
| [0001](0001-hash-routing-over-router-library.md) | Hash routing instead of a router dependency | accepted |
| [0002](0002-jsdoc-typedefs-over-typescript.md) | JSDoc typedefs instead of TypeScript | accepted |
| [0003](0003-url-owns-view-and-filter-state.md) | The URL owns view + filter state; the reducer owns the transient kind | accepted |
| [0004](0004-plain-css-over-css-in-js.md) | Four plain CSS files instead of CSS-in-JS or a utility framework | accepted |
| [0005](0005-no-charting-library.md) | Hand-rolled SVG/CSS charts instead of a charting library | accepted |

Format: context → decision → consequences (good **and** bad) → alternatives rejected.
Add a new record as `NNNN-short-title.md` and link it here; do not rewrite history in an
existing record — supersede it with a new one and mark the old one superseded.