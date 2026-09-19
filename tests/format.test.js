import { describe, expect, it } from 'vitest';
import {
  clamp,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatPercent,
  formatTime,
  humanizeTag,
  padNumber,
  percentOf,
  pluralize,
  safeNumber,
} from '@/utils/format.js';

describe('format helpers', () => {
  it('formats Indian rupee amounts with grouping', () => {
    expect(formatCurrency(59578)).toBe('₹59,578');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('falls back to 0 for non-finite numbers instead of printing NaN', () => {
    expect(formatCurrency(Number.NaN)).toBe('₹0');
    expect(safeNumber(undefined, 7)).toBe(7);
  });

  it('compacts large amounts for headline stats', () => {
    expect(formatCompactCurrency(59578)).toBe('₹60k');
  });

  it('formats dates and times from ISO-ish timestamps', () => {
    expect(formatDate('2025-03-23T07:02:00')).toBe('23 Mar 2025');
    expect(formatTime('2025-03-23T07:02:00')).toBe('07:02');
  });

  it('clamps ratios and converts them to percentages', () => {
    expect(percentOf(5, 10)).toBe(50);
    expect(percentOf(20, 10)).toBe(100);
    expect(percentOf(1, 0)).toBe(0);
    expect(formatPercent(0.4231, 1)).toBe('42.3%');
  });

  it('clamps values inside an inclusive range', () => {
    expect(clamp(-4, 0, 12)).toBe(0);
    expect(clamp(44, 0, 12)).toBe(12);
    expect(clamp(6, 0, 12)).toBe(6);
  });

  it('pluralises counts', () => {
    expect(pluralize(1, 'receipt')).toBe('1 receipt');
    expect(pluralize(0, 'receipt')).toBe('0 receipts');
    expect(pluralize(2, 'little receipt')).toBe('2 little receipts');
  });

  it('pads clock values', () => {
    expect(padNumber(7)).toBe('07');
    expect(padNumber(23)).toBe('23');
    expect(padNumber(5, 3)).toBe('005');
  });

  it('humanises theme tags', () => {
    expect(humanizeTag('late-night')).toBe('Late night');
    expect(humanizeTag('career')).toBe('Career');
  });
});
