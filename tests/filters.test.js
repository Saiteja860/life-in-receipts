import { describe, expect, it } from 'vitest';
import {
  countActiveFilters,
  createSearchIndex,
  DEFAULT_FILTERS,
  filterReceipts,
  groupByChapter,
  matchesFilters,
  sortByTimestamp,
  toggleType,
} from '@/lib/filters.js';
import { TINY_ARCHIVE } from './fixtures.js';

const index = createSearchIndex(TINY_ARCHIVE);

/** Convenience: run a filter and return the matching ids. */
function idsFor(filters) {
  return filterReceipts(TINY_ARCHIVE, { ...DEFAULT_FILTERS, ...filters }, index).map((r) => r.id);
}

describe('explorer query engine', () => {
  it('returns everything for default filters, oldest first', () => {
    expect(idsFor({})).toEqual(['r001', 'r002', 'r003', 'r004']);
  });

  it('sorts newest first when asked', () => {
    expect(idsFor({ ascending: false })).toEqual(['r004', 'r003', 'r002', 'r001']);
  });

  it('matches case-insensitively across every meta field and tag', () => {
    expect(idsFor({ query: 'COLDPLAY' })).toEqual(['r001']);
    expect(idsFor({ query: 'rooftop' })).toEqual(['r001', 'r003']);
    expect(idsFor({ query: 'fitness' })).toEqual(['r003']);
  });

  it('requires every word of a multi-word query to appear', () => {
    expect(idsFor({ query: 'home rooftop' })).toEqual(['r001', 'r003']);
    expect(idsFor({ query: 'home banana' })).toEqual([]);
  });

  it('filters by one or more categories', () => {
    expect(idsFor({ types: ['note'] })).toEqual(['r002']);
    expect(idsFor({ types: ['note', 'photo'] })).toEqual(['r002', 'r004']);
  });

  it('filters by month', () => {
    expect(idsFor({ month: 1 })).toEqual(['r001', 'r002']);
    expect(idsFor({ month: 12 })).toEqual(['r004']);
  });

  it('combines query, category and month', () => {
    expect(idsFor({ query: 'rooftop', types: ['event'], month: 3 })).toEqual(['r003']);
    expect(idsFor({ query: 'rooftop', types: ['event'], month: 1 })).toEqual([]);
  });

  it('never mutates the input list', () => {
    const input = [...TINY_ARCHIVE];
    sortByTimestamp(input, false);
    expect(input).toEqual(TINY_ARCHIVE);
    expect(sortByTimestamp(TINY_ARCHIVE, true)[0].id).toBe('r001');
  });

  it('counts active filters for the reset affordance', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ query: 'a', types: ['music'], month: 6, ascending: false })).toBe(4);
  });

  it('toggles a type immutably', () => {
    const first = toggleType([], 'music');
    expect(first).toEqual(['music']);
    expect(toggleType(first, 'music')).toEqual([]);
    expect(first).toEqual(['music']);
  });

  it('groups receipts into chapters, preserving chapter order', () => {
    const chapters = groupByChapter(TINY_ARCHIVE, [
      { id: 'a2', title: 'Two' },
      { id: 'a1', title: 'One' },
      { id: 'a9', title: 'Empty' },
    ]);
    expect(chapters.map((c) => c.id)).toEqual(['a2', 'a1', 'a9']);
    expect(chapters[1].items.map((r) => r.id)).toEqual(['r001', 'r002', 'r003', 'r004']);
    expect(chapters[2].items).toEqual([]);
  });

  it('treats a missing search index as "no query" instead of crashing', () => {
    expect(matchesFilters(TINY_ARCHIVE[0], { ...DEFAULT_FILTERS, query: 'coldplay' }, undefined)).toBe(false);
    expect(matchesFilters(TINY_ARCHIVE[0], { ...DEFAULT_FILTERS }, undefined)).toBe(true);
  });
});
