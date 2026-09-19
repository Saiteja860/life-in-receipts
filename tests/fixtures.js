// Shared fixtures. Deliberately React-free so pure-logic tests stay fast and
// independent from the component tree.

/** Builds a receipt with sensible defaults; override only what a test cares about. */
export function makeReceipt(overrides = {}) {
  return {
    id: 'r001',
    arc: 'a1',
    type: 'music',
    ts: '2025-01-07T01:52:00',
    title: 'Someone Like You — Adele',
    meta: { artist: 'Adele' },
    tags: ['heartbreak', 'late-night'],
    ...overrides,
  };
}

/**
 * A tiny hand-written archive with known relationships, used to assert the
 * connection engine's scoring without depending on the shipped dataset:
 *  r001 + r002 share a day AND a theme, r003 shares a place with r001,
 *  r004 is deliberately unrelated.
 */
export const TINY_ARCHIVE = [
  makeReceipt({
    id: 'r001',
    ts: '2025-01-07T01:52:00',
    title: 'Fix You — Coldplay',
    meta: { artist: 'Coldplay', place: 'Home rooftop' },
    tags: ['heartbreak', 'late-night'],
  }),
  makeReceipt({
    id: 'r002',
    ts: '2025-01-07T02:31:00',
    title: '2 AM note',
    type: 'note',
    meta: { mood: 1 },
    tags: ['heartbreak', 'late-night'],
  }),
  makeReceipt({
    id: 'r003',
    ts: '2025-03-23T07:02:00',
    title: 'Home rooftop sunrise',
    type: 'event',
    meta: { place: 'Home rooftop' },
    tags: ['fitness'],
  }),
  makeReceipt({
    id: 'r004',
    ts: '2025-12-31T23:59:00',
    title: 'Unrelated receipt',
    type: 'photo',
    meta: { camera: 'front' },
    tags: [],
  }),
];

/** Small chapter map that matches `TINY_ARCHIVE`'s arcs. */
export const TINY_CHAPTER_MAP = {
  a1: {
    id: 'a1',
    num: '01',
    title: 'Chapter One',
    color: '#000',
    mood: 2,
    moodLabel: 'heavy',
    blurb: '',
    span: '',
  },
  a2: {
    id: 'a2',
    num: '02',
    title: 'Chapter Two',
    color: '#111',
    mood: 4,
    moodLabel: 'rising',
    blurb: '',
    span: '',
  },
};
