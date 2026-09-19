// Route ⇄ URL hash serialisation. Pure functions only: the hook in
// `@/hooks/useHashRoute` owns the DOM, this module owns the format.
// Shape: `#/explore?q=bench&type=music,note&month=6&sort=desc`
import { DEFAULT_VIEW, VIEW_IDS } from '@/constants';

/** Default filter values used when the URL omits a parameter. */
export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  types: /** @type {string[]} */ ([]),
  month: 0,
  ascending: true,
});

/**
 * Parses a query string into a partial filter object.
 * Unknown/invalid values are dropped rather than trusted.
 * @param {string} search e.g. `q=bench&month=6`
 * @returns {typeof DEFAULT_FILTERS}
 */
export function parseFilters(search) {
  const params = new URLSearchParams(search || '');
  const query = (params.get('q') || '').slice(0, 120);
  const types = (params.get('type') || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const month = Number.parseInt(params.get('month') || '0', 10);
  const sort = params.get('sort');

  return {
    query,
    types,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0,
    ascending: sort === 'desc' ? false : true,
  };
}

/**
 * Serialises filters, omitting anything at its default value so clean views
 * produce clean URLs.
 * @param {typeof DEFAULT_FILTERS} filters
 * @returns {string} e.g. `q=bench&month=6` (no leading `?`)
 */
export function serializeFilters(filters) {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.types?.length) params.set('type', [...filters.types].sort().join(','));
  if (filters.month) params.set('month', String(filters.month));
  if (filters.ascending === false) params.set('sort', 'desc');
  return params.toString();
}

/**
 * Builds a full location hash for a view + filters.
 * @param {string} view
 * @param {typeof DEFAULT_FILTERS} [filters]
 * @returns {string} e.g. `#/explore?q=goa`
 */
export function buildHash(view, filters = DEFAULT_FILTERS) {
  const safeView = VIEW_IDS.includes(view) ? view : DEFAULT_VIEW;
  const search = serializeFilters({ ...DEFAULT_FILTERS, ...filters });
  return `#/${safeView}${search ? `?${search}` : ''}`;
}

/**
 * Parses `location.hash` into a view + filters pair, falling back safely.
 * @param {string} hash
 * @returns {{ view: string, filters: typeof DEFAULT_FILTERS }}
 */
export function parseHash(hash) {
  const raw = String(hash || '').replace(/^#/, '');
  if (!raw.startsWith('/')) return { view: DEFAULT_VIEW, filters: { ...DEFAULT_FILTERS } };

  const [path, search = ''] = raw.slice(1).split('?');
  const view = VIEW_IDS.includes(path) ? path : DEFAULT_VIEW;
  return { view, filters: parseFilters(search) };
}

/**
 * True when two filter objects are value-equal (used to avoid redundant
 * history writes).
 * @param {typeof DEFAULT_FILTERS} a
 * @param {typeof DEFAULT_FILTERS} b
 * @returns {boolean}
 */
export function filtersEqual(a, b) {
  return serializeFilters(a) === serializeFilters(b);
}
