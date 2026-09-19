// Data-access layer. Everything that knows *where data comes from* lives here;
// components only ever see validated, derived objects.
//
// The archive is static (dataset ships in the bundle), so "the backend" is a
// single validated load, memoised for the lifetime of the page. Swapping in the
// official dataset stays a one-file change: replace `src/data/dataset.json`,
// keep `scripts/generate-data.mjs` in sync, and this module re-validates on boot.
import rawDataset from '@/data/dataset.json';
import { CHAPTERS, CHAPTER_MAP, TYPE_META } from '@/data/chapters.js';
import { buildLinkMap } from '@/lib/links.js';
import { buildInsights } from '@/lib/insights.js';
import { validateDataset } from '@/lib/validate.js';
import { track, trackWarning } from '@/services/telemetry.js';

/** @type {import('@/types').ArchiveBundle|null} */ let cache = null;

/**
 * Loads, validates and derives the whole archive exactly once.
 * @returns {import('@/types').ArchiveBundle}
 */
export function loadArchive() {
  if (cache) return cache;

  const validation = validateDataset(rawDataset, CHAPTER_MAP);
  const receipts = validation.receipts;

  if (!validation.valid) {
    trackWarning('dataset_invalid', { errors: validation.errors.slice(0, 5) });
  }

  const linkMap = buildLinkMap(receipts);
  const insights = buildInsights(receipts, CHAPTER_MAP);
  const connection = connectionStats(linkMap);

  cache = {
    receipts,
    chapters: CHAPTERS,
    chapterMap: CHAPTER_MAP,
    typeMeta: TYPE_META,
    linkMap,
    insights,
    connection,
    issues: { errors: validation.errors, warnings: validation.warnings },
    valid: validation.valid,
  };

  track('archive_loaded', {
    receipts: receipts.length,
    chapters: CHAPTERS.length,
    linkCoverage: connection.coverage,
    datasetValid: validation.valid,
  });

  return cache;
}

/**
 * Clears the memoised bundle. Test-only escape hatch — the running app always
 * uses a single immutable archive.
 */
export function resetArchiveCache() {
  cache = null;
}

/**
 * Coverage statistics for the connection engine, shown in the Patterns view so
 * the "relationships" claim is verifiable by the visitor, not just by the repo.
 * @param {import('@/types').LinkMap} linkMap
 * @returns {{ total: number, connected: number, coverage: number, averageLinks: number, maxLinks: number, reasons: [string, number][] }}
 */
export function connectionStats(linkMap) {
  const entries = Object.values(linkMap);
  const total = entries.length;
  const connected = entries.filter((links) => links.length > 0).length;
  const linkCount = entries.reduce((sum, links) => sum + links.length, 0);
  const maxLinks = entries.reduce((max, links) => Math.max(max, links.length), 0);

  /** @type {Map<string, number>} */
  const reasons = new Map();
  for (const links of entries) {
    for (const link of links) {
      for (const reason of link.reasons) {
        const key = reason.replace(/:.*$/, '');
        reasons.set(key, (reasons.get(key) ?? 0) + 1);
      }
    }
  }

  return {
    total,
    connected,
    coverage: total ? Math.round((connected / total) * 100) : 0,
    averageLinks: total ? Number((linkCount / total).toFixed(2)) : 0,
    maxLinks,
    reasons: [...reasons.entries()].sort((a, b) => b[1] - a[1]),
  };
}
