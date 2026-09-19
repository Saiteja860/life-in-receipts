import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW, VIEWS } from '@/constants';
import { buildHash, filtersEqual, parseFilters, parseHash, serializeFilters } from '@/lib/url.js';

describe('route + filter serialisation', () => {
  it('returns defaults for an empty hash', () => {
    expect(parseHash('')).toEqual({
      view: DEFAULT_VIEW,
      filters: { query: '', types: [], month: 0, ascending: true },
    });
  });

  it('round-trips a filtered explore route', () => {
    const filters = { query: 'bench', types: ['music', 'note'], month: 6, ascending: false };
    const hash = buildHash(VIEWS.EXPLORE, filters);

    expect(hash).toBe('#/explore?q=bench&type=music%2Cnote&month=6&sort=desc');
    expect(parseHash(hash)).toEqual({ view: VIEWS.EXPLORE, filters });
  });

  it('omits default parameters so clean views produce clean URLs', () => {
    expect(buildHash(VIEWS.STORY)).toBe('#/story');
    expect(serializeFilters({ query: '', types: [], month: 0, ascending: true })).toBe('');
  });

  it('falls back to the default view for unknown routes', () => {
    expect(parseHash('#/nope').view).toBe(DEFAULT_VIEW);
    expect(buildHash('nope')).toBe(`#/${DEFAULT_VIEW}`);
  });

  it('rejects out-of-range months and unknown sort values', () => {
    expect(parseFilters('month=19').month).toBe(0);
    expect(parseFilters('month=0').month).toBe(0);
    expect(parseFilters('sort=sideways').ascending).toBe(true);
    expect(parseFilters('month=6').month).toBe(6);
  });

  it('drops empty type entries', () => {
    expect(parseFilters('type=music,,note').types).toEqual(['music', 'note']);
  });

  it('compares filters by serialised value', () => {
    const a = { query: 'goa', types: ['photo'], month: 6, ascending: true };
    expect(filtersEqual(a, { ...a })).toBe(true);
    expect(filtersEqual(a, { ...a, month: 7 })).toBe(false);
  });
});
