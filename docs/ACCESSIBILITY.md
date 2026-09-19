# Accessibility

Target: **WCAG 2.2 AA**. Every item below is either enforced by a test in
`tests/accessibility.test.jsx` or is a CSS rule with a stated reason. Nothing here is
aspirational.

## Keyboard map

| Key | Where | Action |
|---|---|---|
| `Tab` / `Shift+Tab` | everywhere | Move through receipts, chips, controls; **trapped inside the modal while open** |
| `Enter` / `Space` | on a receipt card | Open its thread modal |
| `Enter` | in the Explorer search | No submit/reload (the form is `role="search"` with submit prevented) |
| `Escape` | modal open | Close it and restore focus to the card that opened it |
| `Escape` | compact nav open | Close the navigation drawer |
| `←` / `→` / `↑` / `↓` | month scrubber | Step through All year → Dec (native range behaviour + `aria-valuetext`) |
| `Tab` | first focusable on the page | The skip link, jumping straight to `#main-content` |

## Checklist with code pointers

| # | Requirement | Implementation | Verified by |
|---|---|---|---|
| 1 | Skip to content | `.skip-link` → `#main-content` (`tabIndex={-1}`) | test: *exposes the skip link…* |
| 2 | Semantic landmarks | `<nav aria-label="Primary">`, `<main id="main-content">`, `<section aria-labelledby>` per chapter, `<footer>` | tests: nav label, `getByRole('main')` |
| 3 | One `<h1>` per view | Each view renders its own `h1.view-title`; card titles are `div`s; modal title is `h2` | test: *keeps a single top-level heading per view* |
| 4 | Every control named | Visible labels on real buttons; `aria-label` on icon-only ones (`✕` close, compact nav, copy link); `sr-only` suffix inside cards | test: *gives every control an accessible name* |
| 5 | Form labels | `<label htmlFor>` + `useId()` for search and month; hint wired via `aria-describedby` | test: *associates the search field with its label and hint* |
| 6 | Toggle state exposed | `aria-pressed` on the Connection Lens and every category chip | tests: lens toggle, chip pressed state |
| 7 | Disclosure state exposed | `aria-expanded` + `aria-controls` on chapter disclosures and the compact nav toggle | tests: *describes chapter disclosures…*, *renders the compact navigation toggle…* |
| 8 | Slider value as text | `aria-valuetext={MONTH_FILTER_LABELS[month]}` → "All year", "Jun" | inspected in `Explorer.jsx` |
| 9 | Modal semantics | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → receipt title | test: modal open assertions |
| 10 | Focus moves into the modal | `useFocusTrap` focuses the close button on open | test: *traps focus inside the dialog…* |
| 11 | Focus trapped | `useFocusTrap` wraps `Tab`/`Shift+Tab` across the dialog's focusables | test: 8 × `Tab` stays inside |
| 12 | Escape closes | `useEscapeKey`, active only while open | tests: Escape close in both suites |
| 13 | Focus restored on close | `useFocusTrap` stores and refocuses `document.activeElement` | tests: `expect(card).toHaveFocus()` |
| 14 | No background scroll | `lockScroll()` — reference-counted so nested overlays cannot unlock early | test: overflow `hidden`, then `''` |
| 15 | Live announcements | `<Announcer>` (`role="status"`, `aria-live="polite"`, `aria-atomic`) for view changes and copy feedback; the result counter is its own live region | test: *announces view changes and result counts…* |
| 16 | Charts have alternatives | `MoodArc` → `role="img"` + generated label; `HourHeatStrip` → hidden list + `figcaption`; `MonthBars` → hidden data list | test: `getByRole('img', { name: /mood arc/i })` |
| 17 | Decorative art hidden | Barcodes, chapter thread, strip dots, cover shred, mood labels → `aria-hidden="true"` | test: *hides purely decorative artwork…* |
| 18 | Focus visible | Global `:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px }` — never removed without a replacement | `styles.css` |
| 19 | Reduced motion honoured | Global transition/animation kill switch, `Cover` skips its decode sequence, `scroll-behavior: auto` | test: *skips the cover animation for reduced-motion users* |
| 20 | Colour independence | Every colour cue has a text twin: chapter colour + chapter name, mood colour + `MOOD: label` + glyph, chart colour + printed value | `Chapter.jsx`, `BarMeter.jsx` |
| 21 | Contrast | Text ≥ 4.5:1, large text ≥ 3:1 — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | measured against the token palette |
| 22 | Touch targets (WCAG 2.2) | ≥ 44 px min-height on nav, chips, toggles, disclosures and the modal close button for coarse pointers | `styles/responsive.css` |
| 23 | High contrast / forced colours | `prefers-contrast: more` raises borders and muted text; `forced-colors: active` keeps borders and hands colours to the OS | `styles/responsive.css` |
| 24 | Reduced data | Drops the decorative shred and barcodes under `prefers-reduced-data: reduce` | `styles/responsive.css` |
| 25 | Page title reflects the view | `useDocumentTitle` from the store, which also makes history entries meaningful | `useAnnouncer.js` + provider |