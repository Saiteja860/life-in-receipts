import { describe, expect, it } from 'vitest';
import { LIMITS, LINK_THRESHOLD } from '@/constants';
import { buildLinkMap, findLinks, linkedIdSet, MIN_LINKS, scorePair } from '@/lib/links.js';
import { TINY_ARCHIVE, makeReceipt } from './fixtures.js';

describe('connection engine', () => {
  it('scores a shared day above the threshold', () => {
    const { score, reasons } = scorePair(TINY_ARCHIVE[0], TINY_ARCHIVE[1]);
    expect(reasons).toContain('same day');
    expect(score).toBeGreaterThanOrEqual(LINK_THRESHOLD);
  });

  it('scores a shared place and reports it as a reason', () => {
    const { reasons } = scorePair(TINY_ARCHIVE[0], TINY_ARCHIVE[2]);
    expect(reasons).toContain('same place');
  });

  it('never links a receipt to itself', () => {
    const links = findLinks(TINY_ARCHIVE[0], TINY_ARCHIVE);
    expect(links.map((l) => l.receipt.id)).not.toContain('r001');
  });

  it('guarantees a minimum number of links even for an unrelated receipt', () => {
    const links = findLinks(TINY_ARCHIVE[3], TINY_ARCHIVE);
    expect(links.length).toBeGreaterThanOrEqual(MIN_LINKS);
    expect(links.some((l) => l.reasons.includes('near in time'))).toBe(true);
  });

  it('caps the number of links', () => {
    const many = Array.from({ length: 40 }, (_, index) =>
      makeReceipt({
        id: `r${String(index + 1).padStart(3, '0')}`,
        ts: `2025-01-0${(index % 9) + 1}T10:00:00`,
      })
    );
    expect(findLinks(many[0], many).length).toBeLessThanOrEqual(LIMITS.MAX_LINKS);
  });

  it('sorts links by descending score', () => {
    const links = findLinks(TINY_ARCHIVE[0], TINY_ARCHIVE);
    const scores = links.map((l) => l.score);
    expect([...scores]).toEqual([...scores].sort((a, b) => b - a));
  });

  it('survives receipts with no meta at all', () => {
    const bare = [
      makeReceipt({ id: 'r001', meta: {}, tags: [] }),
      makeReceipt({ id: 'r002', meta: {}, tags: [] }),
    ];
    expect(() => buildLinkMap(bare)).not.toThrow();
    expect(buildLinkMap(bare).r001.length).toBeGreaterThan(0);
  });

  it('builds a complete map: every receipt has at least one thread', () => {
    const map = buildLinkMap(TINY_ARCHIVE);
    expect(Object.keys(map)).toHaveLength(TINY_ARCHIVE.length);
    for (const links of Object.values(map)) expect(links.length).toBeGreaterThan(0);
  });

  it('includes the receipt itself in its lens id set', () => {
    const map = buildLinkMap(TINY_ARCHIVE);
    const set = linkedIdSet(map, 'r001');
    expect(set.has('r001')).toBe(true);
    expect(set.size).toBe(map.r001.length + 1);
  });

  it('returns an empty lens set for an unknown id', () => {
    expect([...linkedIdSet({}, 'nope')]).toEqual(['nope']);
  });
});
