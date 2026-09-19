// Presentation-safe formatting helpers. Pure functions, zero React, no DOM.
// A single cached Intl formatter instance is reused because constructing
// `Intl.*` objects is comparatively expensive in hot render paths.
import { APP } from '@/constants';

/** @type {Intl.DateTimeFormat} */
const SHORT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** @type {Intl.DateTimeFormat} */
const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/**
 * Guards against `NaN` and `Infinity` reaching the UI.
 * @param {number} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * `2025-03-23T07:02:00` → `23 Mar 2025`.
 * @param {string} ts
 * @returns {string}
 */
export function formatDate(ts) {
  return SHORT_DATE.format(new Date(ts));
}

/**
 * `2025-03-23T07:02:00` → `Sun, 23 Mar 2025`.
 * @param {string} ts
 * @returns {string}
 */
export function formatLongDate(ts) {
  return LONG_DATE.format(new Date(ts));
}

/**
 * `2025-03-23T07:02:00` → `07:02`.
 * @param {string} ts
 * @returns {string}
 */
export function formatTime(ts) {
  return String(ts).slice(11, 16);
}

/**
 * `59578` → `₹59,578` (locale-aware, Indian digit grouping).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return `${APP.currencySymbol}${safeNumber(amount).toLocaleString(APP.locale)}`;
}

/**
 * `59578` → `₹60k`. Used for headline stats where precision is noise.
 * @param {number} amount
 * @returns {string}
 */
export function formatCompactCurrency(amount) {
  return `${APP.currencySymbol}${Math.round(safeNumber(amount) / 1000)}k`;
}

/**
 * `0.42` → `42%`.
 * @param {number} ratio 0–1
 * @param {number} [digits=0]
 * @returns {string}
 */
export function formatPercent(ratio, digits = 0) {
  return `${(safeNumber(ratio) * 100).toFixed(digits)}%`;
}

/**
 * Zero-pads a number for clock labels.
 * @param {number} value
 * @param {number} [length=2]
 * @returns {string}
 */
export function padNumber(value, length = 2) {
  return String(value).padStart(length, '0');
}

/**
 * `1` → `1 receipt`, `3` → `3 receipts`.
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural] Defaults to `singular + 's'`.
 * @returns {string}
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Constrains a number to an inclusive range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(safeNumber(value, min), min), max);
}

/**
 * Percent of a total, clamped to 0–100 so bars can never overflow their track.
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
export function percentOf(value, total) {
  if (!total) return 0;
  return clamp((value / total) * 100, 0, 100);
}

/**
 * Title-cases a hyphenated tag: `late-night` → `Late night`.
 * @param {string} tag
 * @returns {string}
 */
export function humanizeTag(tag) {
  const spaced = String(tag).replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
