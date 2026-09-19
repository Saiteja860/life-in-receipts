// The connection engine: derives relationships between receipts from the raw
// data. Six independent signals are scored, then the strongest pairs are kept.
//
//   same day      +3.0   the strongest story signal ("this day happened")
//   same place    +2.5   geographic thread (Cubbon Park, Blue Tokai…)
//   shared theme  +1.2   per tag, max 2 tags counted (fitness, heartbreak…)
//   same week     +0.9   soft temporal proximity for sparse days
//   same arc      +0.6   both belong to the same chapter
//   same type     +0.4   category affinity (music ↔ music)
//
// A pair must clear LINK_THRESHOLD to be reported as a real connection, and
// every receipt is guaranteed at least MIN_LINKS links by falling back to the
// chronologically nearest receipts ("near in time"), so no card is a dead end
// in the lens or in the thread modal.
import { LIMITS, LINK_THRESHOLD, LINK_WEIGHTS } from '@/constants';
import { humanizeTag } from '@/utils/format.js';

/** Minimum links reported per receipt. */
export const MIN_LINKS = 3;

/** `2025-03-23T07:02:00` → `2025-03-23` (string compare avoids Date objects). */
const dayOf = (r) => r.ts.slice(0, 10);

/** Whole weeks since the epoch, used for "same week" proximity. */
function weekOf(r) {
  const midnight = Date.parse(`${dayOf(r)}T00:00:00Z`);
  return Number.isNaN(midnight) ? null : Math.floor(midnight / 604_800_000);
}

/** Absolute difference in minutes between two receipts. */
function minutesApart(a, b) {
  const ta = Date.parse(a.ts);
  const tb = Date.parse(b.ts);
  return Math.abs(ta - tb) / 60_000;
}

/**
 * Scores one ordered pair of receipts.
 * @param {import('@/types').Receipt} a
 * @param {import('@/types').Receipt} b
 * @returns {{ score: number, reasons: string[] }}
 */
export function scorePair(a, b) {
  const reasons = [];
  let score = 0;

  if (dayOf(a) === dayOf(b)) {
    score += LINK_WEIGHTS.DAY;
    reasons.push('same day');
  }

  const placeA = a.meta?.place;
  const placeB = b.meta?.place;
  if (placeA && placeB && (placeA === placeB || placeA.includes(placeB) || placeB.includes(placeA))) {
    score += LINK_WEIGHTS.PLACE;
    reasons.push('same place');
  }

  const tagsB = new Set(b.tags ?? []);
  const shared = (a.tags ?? []).filter((tag) => tagsB.has(tag));
  if (shared.length) {
    score += shared.length * LINK_WEIGHTS.TAG;
    reasons.push(...shared.slice(0, 2).map((tag) => `theme: ${humanizeTag(tag)}`));
  }

  if (!shared.length && !reasons.includes('same day')) {
    const wa = weekOf(a);
    const wb = weekOf(b);
    if (wa != null && wa === wb) {
      score += LINK_WEIGHTS.WEEK;
      reasons.push('same week');
    }
  }

  if (a.arc === b.arc) score += LINK_WEIGHTS.ARC;
  if (a.type === b.type) score += LINK_WEIGHTS.TYPE;

  return { score, reasons };
}

/**
 * For one receipt, returns its related receipts sorted by relevance.
 *
 * @param {import('@/types').Receipt} receipt
 * @param {import('@/types').Receipt[]} all
 * @param {{ minLinks?: number, maxLinks?: number, threshold?: number }} [options]
 * @returns {import('@/types').Link[]}
 */
export function findLinks(receipt, all, options = {}) {
  const { minLinks = MIN_LINKS, maxLinks = LIMITS.MAX_LINKS, threshold = LINK_THRESHOLD } = options;

  /** @type {import('@/types').Link[]} */
  const strong = [];
  /** @type {{ link: import('@/types').Link, distance: number }[]} */
  const fallback = [];

  for (const other of all) {
    if (other.id === receipt.id) continue;
    const { score, reasons } = scorePair(receipt, other);
    if (score >= threshold) {
      strong.push({ receipt: other, score: Number(score.toFixed(2)), reasons });
    } else if (minLinks > 0) {
      fallback.push({
        link: {
          receipt: other,
          score: Number(score.toFixed(2)),
          reasons: [...reasons, 'near in time'],
        },
        distance: minutesApart(receipt, other),
      });
    }
  }

  strong.sort((a, b) => b.score - a.score || a.receipt.ts.localeCompare(b.receipt.ts));
  if (strong.length >= minLinks) return strong.slice(0, maxLinks);

  // Guarantee `minLinks` by adding the nearest-in-time receipts not already in.
  fallback.sort((a, b) => a.distance - b.distance);
  const combined = [...strong];
  for (const { link } of fallback) {
    if (combined.length >= minLinks) break;
    if (!combined.some((existing) => existing.receipt.id === link.receipt.id)) combined.push(link);
  }
  combined.sort((a, b) => b.score - a.score);
  return combined.slice(0, maxLinks);
}

/**
 * Precomputes the id → links index so the UI never calculates a pair twice.
 * @param {import('@/types').Receipt[]} all
 * @returns {import('@/types').LinkMap}
 */
export function buildLinkMap(all) {
  /** @type {import('@/types').LinkMap} */
  const map = {};
  for (const r of all) map[r.id] = findLinks(r, all);
  return map;
}

/** Returns the set of receipt ids linked to the given one (including itself). */
export function linkedIdSet(linkMap, id) {
  const set = new Set([id]);
  for (const link of linkMap[id] ?? []) set.add(link.receipt.id);
  return set;
}
