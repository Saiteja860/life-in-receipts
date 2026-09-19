# ADR 0005 — Hand-rolled SVG/CSS charts instead of a charting library

**Status:** accepted · **Date:** 2025-09-20

## Context

The Patterns view needs five visualisations: a 12-column monthly spending bar chart, a mood
arc (line/points, with gaps where data is missing), a 24-cell hour heat strip, labelled
horizontal meters (places, artists) and a ranked text log (searches). All of them are small,
static (no pan/zoom/tooltips-as-a-feature), and read from data computed in `lib/insights.js`.

A charting library (Recharts, Chart.js, visx) would be an obvious default. This ADR records why
it was rejected — and, importantly, what that costs.

## Decision

Hand-roll every chart as a small component in `src/components/insights/`, using CSS for bars and
meters, and inline SVG only for the mood polyline:

| Component | Technique |
|---|---|
| `MonthBars` | CSS flex columns with percentage heights |
| `BarMeter` | CSS width percentages on a track |
| `MoodArc` | Inline SVG `<polyline>` + `<circle>`, one polyline per contiguous data segment |
| `HourHeatStrip` | CSS grid, opacity encodes volume |
| `CuriosityLog` | Ordered list (no chart at all — this is really a text ranking) |

Every chart publishes a text alternative: the SVG is `role="img"` with a generated `aria-label`,
and the same data is emitted as a visually hidden list. The whole Patterns view costs
**2.8 kB gzip**.

## Consequences

**Good:** no dependency, no bundle baseline, no theming API to fight — the charts speak the
project's own tokens (`--accent`, `--chapter`, `--muted`). Accessibility is designed in rather
than retro-fitted through library props. The mood arc can represent a *gap* (a month with no
mood data) as a break in the line, which is the honest rendering and is awkward in most
libraries. Interaction (none needed) cannot accidentally hijack scroll on mobile.

**Bad / accepted:** no tooltips beyond native `title` attributes; no zoom/brush; no axes,
gridlines or legend machinery. Adding a genuinely complex chart (stacked, grouped, many series)
would mean writing real geometry, and at that point a library becomes the right call. Number
formatting and scales are our problem, mitigated by `percentOf()` and `unit()` props being
shared with the text alternatives.

## Alternatives rejected

- **Recharts** — ~100 kB+ gz for five static visuals; would be the single largest dependency
  after React itself, for no functional gain at this data size.
- **Chart.js** — canvas rendering, so no semantics to hang accessibility on and no CSS theming;
  text alternatives would have to be bolted on separately anyway.
- **visx / D3** — D3's scale and shape utilities are genuinely useful, but pulling `d3-scale`
  to compute `(value / max) * 100` is a dependency for arithmetic.
- **Tables instead of charts** — weakest visual storytelling for a judged "clear visual
  representation of the journey"; tables remain as the screen-reader alternative instead of
  replacing the visual.