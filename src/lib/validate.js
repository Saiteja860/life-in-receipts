// Dataset guard rail. The archive ships its data inside the bundle, so the
// cheapest possible "backend contract" is a one-time structural validation at
// start-up: if a swapped-in official dataset is malformed we surface a real
// error message instead of rendering `undefined` a hundred times.
import { RECEIPT_TYPES } from '@/constants';

/** Matches `YYYY-MM-DDTHH:mm:ss` (what `dataset.json` guarantees). */
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
/** Ids look like `r001` — zero-padded so lexical sort === chronological sort. */
const ID_RE = /^r\d{3,}$/;

/**
 * Validates a single candidate receipt.
 * @param {unknown} value
 * @param {number} index
 * @param {string[]} errors
 * @param {string[]} warnings
 * @returns {boolean} true when the value is structurally usable
 */
function validateReceipt(value, index, errors, warnings) {
  const where = `receipt[${index}]`;
  if (!value || typeof value !== 'object') {
    errors.push(`${where}: not an object`);
    return false;
  }

  const r = /** @type {Record<string, any>} */ (value);
  if (typeof r.id !== 'string' || !ID_RE.test(r.id)) errors.push(`${where}: invalid id "${r.id}"`);
  if (!RECEIPT_TYPES.includes(r.type)) errors.push(`${where} (${r.id}): unknown type "${r.type}"`);
  if (typeof r.arc !== 'string' || !r.arc) errors.push(`${where} (${r.id}): missing arc`);
  if (typeof r.title !== 'string' || !r.title.trim()) errors.push(`${where} (${r.id}): missing title`);
  if (typeof r.ts !== 'string' || !TIMESTAMP_RE.test(r.ts)) {
    errors.push(`${where} (${r.id}): malformed timestamp "${r.ts}"`);
  } else if (Number.isNaN(Date.parse(r.ts))) {
    errors.push(`${where} (${r.id}): unparseable timestamp "${r.ts}"`);
  }
  if (r.meta == null || typeof r.meta !== 'object' || Array.isArray(r.meta)) {
    errors.push(`${where} (${r.id}): meta must be an object`);
  }
  if (r.tags != null && (!Array.isArray(r.tags) || r.tags.some((t) => typeof t !== 'string'))) {
    errors.push(`${where} (${r.id}): tags must be a string array`);
  } else if (!r.tags?.length) {
    warnings.push(`${where} (${r.id}): no tags — the connection engine loses signal`);
  }
  return true;
}

/**
 * Validates the whole dataset: structure, uniqueness, coverage and chronology.
 * Never throws — every problem is reported in `errors`/`warnings`.
 * @param {unknown} raw Parsed `dataset.json` (or any swap-in candidate)
 * @param {import('@/types').ChapterMap} [chapterMap] Used for arc coverage checks
 * @returns {import('@/types').ValidationResult}
 */
export function validateDataset(raw, chapterMap) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(raw)) {
    return { valid: false, receipts: [], errors: ['dataset: expected an array of receipts'], warnings };
  }
  if (raw.length === 0) errors.push('dataset: empty');

  const receipts = raw.filter((r, i) => validateReceipt(r, i, errors, warnings));

  const ids = new Set();
  for (const r of receipts) {
    if (ids.has(r.id)) errors.push(`dataset: duplicate id "${r.id}"`);
    ids.add(r.id);
  }

  const types = new Set(receipts.map((r) => r.type));
  const missingTypes = RECEIPT_TYPES.filter((t) => !types.has(t));
  if (missingTypes.length) warnings.push(`dataset: uncovered categories → ${missingTypes.join(', ')}`);

  if (chapterMap) {
    const arcs = new Set(Object.keys(chapterMap));
    const orphanArcs = [...new Set(receipts.map((r) => r.arc))].filter((a) => !arcs.has(a));
    if (orphanArcs.length) errors.push(`dataset: arcs without chapters → ${orphanArcs.join(', ')}`);
  }

  const sorted = receipts.every((r, i) => i === 0 || receipts[i - 1].ts <= r.ts);
  if (!sorted) warnings.push('dataset: not in chronological order (search still works, chapters read oddly)');

  return { valid: errors.length === 0, receipts, errors, warnings };
}
