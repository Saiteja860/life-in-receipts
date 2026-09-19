// Explorer query engine. Pure and synchronous so it can be unit-tested and
// memoised: the UI never filters inline, it asks this module.
//
// Performance note: the "haystack" for full-text search is built once per
// dataset (`createSearchIndex`) instead of per keystroke × per receipt. With
// 163 receipts × ~9 fields that removes ~1.5k object walks from every keypress.
import { DEFAULT_FILTERS } from './url.js';

export { DEFAULT_FILTERS };

/** Month number from a timestamp without constructing a Date object. */
const monthOf = (ts) => Number(ts.slice(5, 7));

/**
 * Pre-computes a lowercase search haystack for every receipt.
 * @param {import('@/types').Receipt[]} receipts
 * @returns {Map<string, string>} id → haystack
 */
export function createSearchIndex(receipts) {
  const index = new Map();
  for (const r of receipts) {
    const haystack = [r.title, r.arc, r.type, r.ts, ...Object.values(r.meta ?? {}), ...(r.tags ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    index.set(r.id, haystack);
  }
  return index;
}

/**
 * Does a receipt satisfy the query + type + month filters?
 * @param {import('@/types').Receipt} receipt
 * @param {import('@/types').Filters} filters
 * @param {Map<string, string>} index
 * @returns {boolean}
 */
export function matchesFilters(receipt, filters, index) {
  const selectedTypes = filters.types ?? [];
  if (selectedTypes.length && !selectedTypes.includes(receipt.type)) return false;
  if (filters.month && monthOf(receipt.ts) !== filters.month) return false;

  const needle = (filters.query ?? '').trim().toLowerCase();
  if (!needle) return true;

  const haystack = index?.get(receipt.id) ?? '';
  // Multi-word queries must all appear, in any order — "goa flight" works.
  return needle.split(/\s+/).every((token) => haystack.includes(token));
}

/**
 * Sorts a copy of the list by timestamp (oldest-first or newest-first).
 * @param {import('@/types').Receipt[]} receipts
 * @param {boolean} ascending
 * @returns {import('@/types').Receipt[]}
 */
export function sortByTimestamp(receipts, ascending = true) {
  const copy = [...receipts];
  copy.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  return ascending ? copy : copy.reverse();
}

/**
 * The single entry point the Explorer uses: filter + sort in one pass.
 * @param {import('@/types').Receipt[]} receipts
 * @param {import('@/types').Filters} filters
 * @param {Map<string, string>} [index] Pre-built search index (recommended)
 * @returns {import('@/types').Receipt[]}
 */
export function filterReceipts(receipts, filters, index) {
  const matched = receipts.filter((r) => matchesFilters(r, filters, index));
  return sortByTimestamp(matched, filters.ascending !== false);
}

/**
 * Number of non-default filters — drives the "clear filters" affordance.
 * @param {import('@/types').Filters} filters
 * @returns {number}
 */
export function countActiveFilters(filters) {
  return (
    (filters.query ? 1 : 0) +
    (filters.types?.length ? 1 : 0) +
    (filters.month ? 1 : 0) +
    (filters.ascending === false ? 1 : 0)
  );
}

/**
 * Toggles one receipt type in the selected set (immutably).
 * @param {string[]} types
 * @param {string} type
 * @returns {string[]}
 */
export function toggleType(types, type) {
  const next = new Set(types ?? []);
  if (next.has(type)) next.delete(type);
  else next.add(type);
  return [...next];
}

/**
 * Groups receipts by their chapter arc, preserving chapter order.
 * @param {import('@/types').Receipt[]} receipts
 * @param {import('@/types').Chapter[]} chapters
 * @returns {import('@/types').Chapter[]} chapters with `items` populated
 */
export function groupByChapter(receipts, chapters) {
  const buckets = new Map(chapters.map((c) => [c.id, []]));
  for (const r of receipts) buckets.get(r.arc)?.push(r);
  return chapters.map((c) => ({ ...c, items: buckets.get(c.id) ?? [] }));
}
