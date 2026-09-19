# Data schema & swap-in contract

## Shape of `src/data/dataset.json`

An **array of receipt objects**, ordered oldest → newest:

```json
[
  {
    "id": "r001",
    "arc": "a1",
    "type": "music",
    "ts": "2025-01-07T01:52:00",
    "title": "Someone Like You — Adele",
    "meta": { "artist": "Adele", "note": "repeated 11×" },
    "tags": ["heartbreak", "late-night"]
  }
]
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `id` | `string` | ✅ | Matches `^r\d{3,}$`. Unique. Zero-padded so lexical order === chronological order. |
| `arc` | `string` | ✅ | Must exist in `CHAPTER_MAP` (`a1`…`a8`). Failures are **errors**. |
| `type` | `string` | ✅ | One of the nine categories below. Unknown values are **errors**. |
| `ts` | `string` | ✅ | `YYYY-MM-DDTHH:mm:ss`, parseable by `Date.parse`. No timezone suffix (local time is intentional). |
| `title` | `string` | ✅ | Non-empty. This is the receipt's headline. |
| `meta` | `object` | ✅ | Never an array. Keys are printed verbatim (uppercased) on the receipt. |
| `tags` | `string[]` | ⚠️ | Missing/empty is a **warning**: the receipt loses theme-based connection signal. |

### Categories (`RECEIPT_TYPES`)

`music` · `movie` · `place` · `purchase` · `photo` · `message` · `search` · `event` · `note`

### `meta` keys the UI treats specially

| Key | Type | Where it is used |
|---|---|---|
| `price` | `number` | Summed into the Ledger + monthly spending bars; printed as `TOTAL` in rupee format |
| `place` | `string` | `same place` connection signal; "The Regulars" chart; Explorer search |
| `artist` | `string` | "The Soundtrack" chart (value `self-curated` is excluded from that chart) |
| `contact` | `string` | Most-messaged chart (messages only); Explorer search |
| `mood` | `number` 1–5 | Mood arc (averaged per month); everything else is inferred from chapters |
| `item`, `query`, `where`, `dwell`, `rating`, `note`, `text`, `camera`, `engine` | `string` | Printed on the card/modal and included in full-text search |

**Any other key is safe** — it is printed on the modal receipt under its uppercase name and
is searchable. Unknown numeric keys other than `price`/`mood` are printed as text.

## Validation

`src/lib/validate.js` runs at boot from `archiveService.loadArchive()` and again in
`npm run smoke`. It never throws; it returns:

```js
{ valid: boolean, receipts: Receipt[], errors: string[], warnings: string[] }
```

| Check | Severity |
|---|---|
| Payload is an array, non-empty | error |
| Each item is an object | error |
| `id` format + uniqueness | error |
| `type` is a known category | error |
| `arc` present **and mapped to a chapter** (when a chapter map is supplied) | error |
| `title` non-empty | error |
| `ts` format + `Date.parse` parseable | error |
| `meta` is a plain object / `tags` is a string array | error |
| All nine categories represented | warning |
| Receipt has at least one tag | warning |
| Chronological order | warning |

A dataset with **errors** still renders — the invalid rows are dropped and the rest of the
archive works — but `npm run smoke` exits non-zero so CI blocks the change.

## Swap-in procedure

1. Drop the official file in as `src/data/dataset.json` (same shape, same key).
2. Run:

   ```bash
   npm run smoke     # schema, categories, arcs, chronology, connectivity, search
   npm test          # engines still behave on fixtures
   npm run build
   ```

3. If the official data uses different category names or arcs, update
   `RECEIPT_TYPES` (`src/constants/index.js`), `TYPE_META` and `CHAPTERS`
   (`src/data/chapters.js`) — nothing else needs touching.
4. If the official data has **no** relationships planted, expect the connection report to
   show lower coverage; the engine guarantees ≥3 links per receipt via `near in time`, so
   the lens and the thread modal never dead-end.

## What the engines assume

| Assumption | Enforced by | If violated |
|---|---|---|
| Timestamps are local, sortable strings | `validate.js` | Timeline/chapter ordering is unreliable (warning raised) |
| `id` is stable across builds | `validate.js` (`ID_RE`) + generator | Links and deep-linked receipts can change target |
| `price` is in the same currency (₹) | convention | The Ledger sums mixed currencies silently |
| Each receipt belongs to exactly one arc | schema | A receipt appears in the first matching chapter only |
| `arc` ids sort in reading order (`a1`…`a8`) | `CHAPTERS` array order | Chapter rail order differs from year order |

## Regenerating the fictional dataset

```bash
npm run data      # node scripts/generate-data.mjs → src/data/dataset.json
```

The generator plants the story deliberately: shared days (e.g. two receipts on 2025-06-05),
recurring places (Cubbon Park, Blue Tokai Coffee) and overlapping theme tags, so the
connection engine surfaces **non-trivial** relationships instead of noise. Current output:
**163 receipts · 9/9 categories · 8/8 arcs · 163/163 connected · ≥3 threads each.**