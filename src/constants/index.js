// Single source of truth for every literal the app shares.
// Rule of thumb: no magic numbers or magic strings anywhere else in `src/`.

/** App-level identity strings. */
export const APP = {
  name: 'Your Life, In Receipts',
  tagline: 'The Archive',
  year: 2025,
  locale: 'en-IN',
  currency: 'INR',
  currencySymbol: '₹',
  chapters: 8,
};

/** Route / view identifiers. One value === one rendered screen. */
export const VIEWS = {
  COVER: 'cover',
  STORY: 'story',
  EXPLORE: 'explore',
  INSIGHTS: 'insights',
};

/** The default view when no (or an unknown) route is present in the URL. */
export const DEFAULT_VIEW = VIEWS.STORY;

/** Views reachable from the top navigation, in display order. */
export const NAV_ITEMS = [
  { id: VIEWS.STORY, label: 'The Story' },
  { id: VIEWS.EXPLORE, label: 'Explorer' },
  { id: VIEWS.INSIGHTS, label: 'Patterns' },
];

/** Every view id, used for route validation. */
export const VIEW_IDS = Object.values(VIEWS);

/** Month names, index 0 === January. */
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Month filter labels: index 0 means "no month filter". */
export const MONTH_FILTER_LABELS = ['All year', ...MONTHS];

/**
 * The nine categories the brief requires the archive to cover.
 * Kept here (not in `chapters.js`) so validation never depends on styling.
 */
export const RECEIPT_TYPES = [
  'music',
  'movie',
  'place',
  'purchase',
  'photo',
  'message',
  'search',
  'event',
  'note',
];

/** Hard caps that keep the DOM small and the UI predictable. */
export const LIMITS = {
  CHAPTER_PREVIEW: 7,
  STRIP_DOTS: 40,
  INSIGHT_SEARCHES: 9,
  INSIGHT_PLACES: 5,
  INSIGHT_ARTISTS: 4,
  INSIGHT_CONTACTS: 4,
  MAX_LINKS: 8,
  /** Cards revealed per scroll batch in long grids. */
  REVEAL_BATCH: 24,
  /** Milliseconds before the live region is cleared. */
  ANNOUNCE_TTL: 1500,
};

/** Scoring weights for the connection engine (see `src/lib/links.js`). */
export const LINK_WEIGHTS = {
  DAY: 3,
  PLACE: 2.5,
  TAG: 1.2,
  WEEK: 0.9,
  ARC: 0.6,
  TYPE: 0.4,
};

/** A pair must score at least this much to count as a connection. */
export const LINK_THRESHOLD = 2.4;

/** Deterministic card tilt: `((hash % SPREAD) - HALF) * STEP` degrees. */
export const TILT = { SPREAD: 7, HALF: 3, STEP: 0.35, HASH_MULTIPLIER: 31 };

/** localStorage keys, namespaced so they never collide with host pages. */
export const STORAGE_KEYS = {
  LENS: 'lir:lens',
  LENS_LEGACY: 'life-in-receipts:lens',
};

/** Breakpoints mirrored in CSS (`src/styles/responsive.css`). */
export const BREAKPOINTS = {
  xs: 360,
  sm: 480,
  md: 720,
  lg: 960,
  xl: 1200,
};

/** CSS custom properties the JS layer is allowed to set. */
export const CSS_VARS = {
  TILT: '--tilt',
  INK: '--ink',
  CHAPTER: '--chapter',
};
