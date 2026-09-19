import { afterEach, describe, expect, it } from 'vitest';
import dataset from '@/data/dataset.json';
import { loadArchive, resetArchiveCache, connectionStats } from '@/services/archiveService.js';
import { MIN_LINKS } from '@/lib/links.js';

afterEach(() => resetArchiveCache());

describe('archive service (data-access layer)', () => {
  it('loads, validates and derives the shipped dataset', () => {
    const archive = loadArchive();

    expect(archive.valid).toBe(true);
    expect(archive.issues.errors).toEqual([]);
    expect(archive.receipts).toHaveLength(dataset.length);
    expect(archive.chapters).toHaveLength(8);
    expect(Object.keys(archive.chapterMap)).toHaveLength(8);
    expect(Object.keys(archive.typeMeta)).toHaveLength(9);
  });

  it('derives insights that agree with the receipt count and type tally', () => {
    const { receipts, insights } = loadArchive();
    expect(insights.total).toBe(receipts.length);
    const tally = Object.values(insights.byType).reduce((a, b) => a + b, 0);
    expect(tally).toBe(receipts.length);
    expect(insights.byType.photo).toBe(insights.totalPhotos);
  });

  it('memoises the archive so the engines run exactly once per page load', () => {
    const first = loadArchive();
    expect(loadArchive()).toBe(first);

    resetArchiveCache();
    const rebuilt = loadArchive();
    expect(rebuilt).not.toBe(first);
    expect(rebuilt.receipts).toHaveLength(dataset.length);
  });

  it('connects every receipt to at least one thread', () => {
    const { receipts, linkMap, connection } = loadArchive();
    for (const receipt of receipts) {
      expect(linkMap[receipt.id]?.length ?? 0).toBeGreaterThanOrEqual(MIN_LINKS);
    }
    expect(connection.coverage).toBe(100);
    expect(connection.averageLinks).toBeGreaterThan(0);
    expect(connection.reasons.map(([reason]) => reason)).toContain('same day');
  });

  it('summarises an empty or malformed map without dividing by zero', () => {
    expect(connectionStats({})).toMatchObject({ total: 0, connected: 0, coverage: 0, averageLinks: 0 });
  });

  it('reports coverage again after a reset (no stale cache)', () => {
    const first = loadArchive().connection.coverage;
    resetArchiveCache();
    expect(loadArchive().connection.coverage).toBe(first);
  });
});
