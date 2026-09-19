import { describe, expect, it } from 'vitest';
import { RECEIPT_TYPES } from '@/constants';
import { buildInsights } from '@/lib/insights.js';
import { TINY_ARCHIVE, TINY_CHAPTER_MAP } from './fixtures.js';

const stats = buildInsights(TINY_ARCHIVE, TINY_CHAPTER_MAP);

describe('insight engine', () => {
  it('counts totals and initialises every category', () => {
    expect(stats.total).toBe(4);
    expect(Object.keys(stats.byType).sort()).toEqual([...RECEIPT_TYPES].sort());
    expect(stats.byType.music).toBe(1);
    expect(stats.byType.note).toBe(1);
    expect(stats.byType.movie).toBe(0);
  });

  it('keeps monthly series at twelve entries', () => {
    expect(stats.spendByMonth).toHaveLength(12);
    expect(stats.countByMonth).toHaveLength(12);
    expect(stats.moodByMonth).toHaveLength(12);
    expect(stats.countByMonth.reduce((a, b) => a + b, 0)).toBe(4);
  });

  it('bins receipts by hour and sums to the total', () => {
    expect(stats.hourBins).toHaveLength(24);
    expect(stats.hourBins.reduce((a, b) => a + b, 0)).toBe(4);
    expect(stats.hourBins[1]).toBe(1); // the 01:52 play
  });

  it('computes the 2 AM Index inputs', () => {
    expect(stats.musicTotal).toBe(1);
    expect(stats.lateNightMusic).toBe(1);
  });

  it('finds the busiest day and the longest streak', () => {
    expect(stats.busiest).toEqual({ date: '2025-01-07', count: 2 });
    expect(stats.streak).toEqual({ start: '2025-01-07', end: '2025-01-07', days: 1 });
  });

  it('derives mood from explicit values and falls back to chapter mood', () => {
    expect(stats.moodByMonth[0]).toBe(1); // explicit note mood
    expect(stats.moodByMonth[2]).toBe(2); // inferred from chapter arc
    expect(stats.moodByMonth[5]).toBeNull(); // no receipts, no arc
    expect(stats.averageMood).toBe(1.67);
  });

  it('records the busiest weekday from the data', () => {
    expect(stats.busiestWeekday).toBe(2); // 2025-01-07 is a Tuesday
  });

  it('ranks places, artists and contacts with limits applied', () => {
    expect(stats.topPlaces[0]).toEqual(['Home rooftop', 2]);
    expect(stats.topArtists).toEqual([['Coldplay', 1]]);
    expect(stats.uniquePlaces).toBe(1);
    expect(stats.topContacts).toEqual([]);
  });

  it('collects searches without their quotes', () => {
    const withSearch = buildInsights(
      [
        ...TINY_ARCHIVE,
        { ...TINY_ARCHIVE[0], id: 'r005', type: 'search', title: '"how to stop thinking about someone"' },
      ],
      TINY_CHAPTER_MAP
    );
    expect(withSearch.searches[0]).toBe('how to stop thinking about someone');
  });

  it('handles an empty dataset without throwing', () => {
    const empty = buildInsights([], TINY_CHAPTER_MAP);
    expect(empty.total).toBe(0);
    expect(empty.busiest).toBeNull();
    expect(empty.streak.days).toBe(0);
    expect(empty.averageMood).toBeNull();
    expect(empty.topPlaces).toEqual([]);
    expect(empty.moodByMonth.every((m) => m === null)).toBe(true);
  });

  it('exposes the twelve month labels used by the charts', () => {
    expect(stats.months).toHaveLength(12);
    expect(stats.months[0]).toBe('Jan');
    expect(stats.months[11]).toBe('Dec');
  });
});
