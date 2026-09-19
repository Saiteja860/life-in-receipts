// Headless dataset integrity check — run with `npm run smoke`.
//
// Why this exists next to the unit tests: the tests prove the *engines* work on
// fixtures, this proves the *shipped dataset* still satisfies every promise the
// UI makes (nine categories, eight mapped arcs, chronological order, a real
// connection for every receipt). It exits non-zero on failure so CI can gate on it.
//
// It imports the same validation and engine modules the app uses, so there is no
// second implementation of the rules to drift out of sync. It is executed through
// `vite-node` so the `@/…` import alias resolves exactly as it does in the app.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const raw = JSON.parse(readFileSync(join(root, 'src', 'data', 'dataset.json'), 'utf8'));
const { CHAPTER_MAP, TYPE_META } = await import('../src/data/chapters.js');
const { validateDataset } = await import('../src/lib/validate.js');
const { buildLinkMap, MIN_LINKS } = await import('../src/lib/links.js');
const { buildInsights } = await import('../src/lib/insights.js');
const { createSearchIndex, filterReceipts, DEFAULT_FILTERS } = await import('../src/lib/filters.js');

const checks = [];
/**
 * Records a check outcome.
 * @param {string} label
 * @param {boolean} passed
 * @param {unknown} [detail]
 */
function check(label, passed, detail) {
  checks.push({ label, passed, detail });
  const icon = passed ? 'PASS' : 'FAIL';
  console.log(`${icon}  ${label}${detail === undefined ? '' : `  →  ${detail}`}`);
}

const validation = validateDataset(raw, CHAPTER_MAP);
console.log(
  `\nDataset: ${raw.length} receipts · ${Object.keys(TYPE_META).length} categories · ${Object.keys(CHAPTER_MAP).length} chapters\n`
);

check(
  'dataset is structurally valid',
  validation.valid,
  validation.errors.slice(0, 3).join(' | ') || 'no errors'
);
check('no validation warnings', validation.warnings.length === 0, validation.warnings.join(' | ') || 'clean');

const types = new Set(raw.map((r) => r.type));
const missingTypes = Object.keys(TYPE_META).filter((t) => !types.has(t));
check('all nine categories represented', missingTypes.length === 0, missingTypes.join(', ') || 'music…note');

check(
  'receipts are in chronological order',
  raw.every((r, i) => i === 0 || raw[i - 1].ts <= r.ts)
);

const arcs = new Set(raw.map((r) => r.arc));
check(
  'every arc maps to a chapter',
  [...arcs].every((a) => CHAPTER_MAP[a]),
  `${arcs.size} arcs`
);

const linkMap = buildLinkMap(raw);
const withLinks = Object.values(linkMap).filter((links) => links.length > 0).length;
const minLinks = Math.min(...Object.values(linkMap).map((l) => l.length));
check(
  'every receipt has at least one thread',
  withLinks === raw.length,
  `${withLinks}/${raw.length} connected`
);
check(`minimum ${MIN_LINKS} links per receipt`, minLinks >= MIN_LINKS, `lowest = ${minLinks}`);

const insights = buildInsights(raw, CHAPTER_MAP);
check('insights total matches the dataset', insights.total === raw.length, `${insights.total}`);
check(
  'monthly spend sums to the ledger total',
  Math.round(insights.spendByMonth.reduce((a, b) => a + b, 0)) === Math.round(insights.totalSpend),
  `₹${insights.totalSpend.toLocaleString('en-IN')}`
);
check('hour bins cover every receipt', insights.hourBins.reduce((a, b) => a + b, 0) === raw.length);

const index = createSearchIndex(raw);
const searchable = filterReceipts(raw, { ...DEFAULT_FILTERS, query: 'goa' }, index).length;
check('full-text search is wired to the dataset', searchable > 0, `${searchable} hit(s) for "goa"`);

const failures = checks.filter((c) => !c.passed);
console.log(
  `\n${checks.length - failures.length}/${checks.length} checks passed` +
    ` · busiest day ${insights.busiest?.date} (${insights.busiest?.count})` +
    ` · 2 AM index ${Math.round((insights.lateNightMusic / insights.musicTotal) * 100)}%` +
    ` · streak ${insights.streak.days} day(s)\n`
);

if (failures.length > 0) {
  console.error(`${failures.length} dataset check(s) failed.`);
  process.exitCode = 1;
}
