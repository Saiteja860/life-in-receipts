// The insight engine: computes the "so what?" layer from the raw receipts.
// Pure functions over plain data — no React, no DOM — so every number shown in
// the Patterns view is unit-testable and reproducible.
import { LIMITS, MONTHS, RECEIPT_TYPES } from '@/constants';

/** Hour of day (0–23) from a timestamp, without allocating a Date. */
const hourOf = (ts) => Number(ts.slice(11, 13));
/** Month index (0–11) from a timestamp. */
const monthOf = (ts) => Number(ts.slice(5, 7)) - 1;
/** Weekday index (0 = Sunday) from a timestamp, resolved in UTC for determinism. */
const weekdayOf = (ts) => new Date(`${ts.slice(0, 10)}T00:00:00Z`).getUTCDay();

/**
 * Tallies how many receipts share a field.
 * @param {import('@/types').Receipt[]} receipts
 * @param {(r: import('@/types').Receipt) => string|undefined} pick
 * @returns {Map<string, number>}
 */
function tally(receipts, pick) {
  const counts = new Map();
  for (const r of receipts) {
    const key = pick(r);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Top-N entries of a tally, sorted by count then name (deterministic output).
 * @param {Map<string, number>} counts
 * @param {number} limit
 * @returns {[string, number][]}
 */
function topN(counts, limit) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

/**
 * Longest run of consecutive calendar days containing at least one receipt.
 * This pattern exists only in aggregate — no single receipt shows it.
 * @param {string[]} days sorted unique `YYYY-MM-DD` values
 * @returns {{ start: string, end: string, days: number }}
 */
function longestStreak(days) {
  let best = { start: '', end: '', days: 0 };
  let runStart = null;
  let previous = null;

  for (const day of days) {
    const time = Date.parse(`${day}T00:00:00Z`);
    if (previous == null || time - previous !== 86_400_000) runStart = day;
    const length = Math.round((time - Date.parse(`${runStart}T00:00:00Z`)) / 86_400_000) + 1;
    if (length > best.days) best = { start: runStart, end: day, days: length };
    previous = time;
  }
  return best;
}

/**
 * Builds every derived statistic the UI needs, in a single pass over the dataset.
 * @param {import('@/types').Receipt[]} receipts
 * @param {import('@/types').ChapterMap} chapterMap
 * @returns {import('@/types').Insights}
 */
export function buildInsights(receipts, chapterMap) {
  const byType = Object.fromEntries(RECEIPT_TYPES.map((type) => [type, 0]));
  const spendByMonth = Array(12).fill(0);
  const countByMonth = Array(12).fill(0);
  const hourBins = Array(24).fill(0);
  const weekdayBins = Array(7).fill(0);
  const moodAcc = Array.from({ length: 12 }, () => []);

  let totalSpend = 0;
  let lateNightMusic = 0;
  let musicTotal = 0;

  for (const r of receipts) {
    byType[r.type] = (byType[r.type] ?? 0) + 1;
    countByMonth[monthOf(r.ts)] += 1;
    hourBins[hourOf(r.ts)] += 1;
    weekdayBins[weekdayOf(r.ts)] += 1;

    const price = r.meta?.price;
    if (typeof price === 'number') {
      spendByMonth[monthOf(r.ts)] += price;
      totalSpend += price;
    }

    if (r.type === 'music') {
      musicTotal += 1;
      const hour = hourOf(r.ts);
      if (hour >= 0 && hour < 4) lateNightMusic += 1;
    }

    if (typeof r.meta?.mood === 'number') moodAcc[monthOf(r.ts)].push(r.meta.mood);
  }

  // Mood arc: average of explicit moods per month, else inferred from the
  // chapters that overlap that month, so the line never has holes.
  const moodByMonth = moodAcc.map((values, month) => {
    if (values.length) return values.reduce((a, b) => a + b, 0) / values.length;
    const arcs = new Set(receipts.filter((r) => monthOf(r.ts) === month).map((r) => r.arc));
    const chapterMoods = [...arcs].map((arc) => chapterMap[arc]?.mood).filter(Boolean);
    return chapterMoods.length ? chapterMoods.reduce((a, b) => a + b, 0) / chapterMoods.length : null;
  });

  const knownMoods = moodByMonth.filter((value) => value != null);

  // Busiest single day — "a day fully lived".
  const byDay = new Map();
  for (const r of receipts) {
    const day = r.ts.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  let busiest = null;
  for (const [date, count] of byDay) {
    if (!busiest || count > busiest.count) busiest = { date, count };
  }

  const artists = tally(receipts, (r) =>
    r.type === 'music' && r.meta?.artist && r.meta.artist !== 'self-curated'
      ? String(r.meta.artist)
      : undefined
  );
  const places = tally(receipts, (r) => (r.meta?.place ? String(r.meta.place) : undefined));
  const contacts = tally(receipts, (r) =>
    r.type === 'message' && r.meta?.contact ? String(r.meta.contact) : undefined
  );

  const monthEntries = countByMonth
    .map((count, month) => ({ month, count }))
    .sort((a, b) => b.count - a.count);

  const busiestWeekdayIndex = weekdayBins.indexOf(Math.max(...weekdayBins));

  return {
    total: receipts.length,
    byType,
    spendByMonth,
    countByMonth,
    totalSpend,
    hourBins,
    weekdayBins,
    lateNightMusic,
    musicTotal,
    topPlaces: topN(places, LIMITS.INSIGHT_PLACES),
    topArtists: topN(artists, LIMITS.INSIGHT_ARTISTS),
    topContacts: topN(contacts, LIMITS.INSIGHT_CONTACTS),
    uniquePlaces: places.size,
    uniqueArtists: artists.size,
    uniqueContacts: contacts.size,
    moodByMonth,
    averageMood: knownMoods.length
      ? Number((knownMoods.reduce((a, b) => a + b, 0) / knownMoods.length).toFixed(2))
      : null,
    moodPeak: knownMoods.length ? Math.max(...knownMoods) : null,
    moodLow: knownMoods.length ? Math.min(...knownMoods) : null,
    busiestMonth: monthEntries[0] ?? null,
    quietestMonth: monthEntries[monthEntries.length - 1] ?? null,
    busiestWeekday: busiestWeekdayIndex >= 0 ? busiestWeekdayIndex : null,
    streak: longestStreak([...byDay.keys()].sort()),
    searches: receipts.filter((r) => r.type === 'search').map((r) => String(r.title).replace(/"/g, '')),
    totalPhotos: byType.photo ?? 0,
    totalEvents: byType.event ?? 0,
    busiest,
    months: MONTHS,
  };
}
