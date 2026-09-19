// The single store for the whole app: data access + route state + UI state,
// exposed through one context so no component needs prop drilling.
//
//   URL (hash)      → view + filters          (shareable, back/forward works)
//   reducer         → lens, hover, modal, chapters
//   archiveService  → validated dataset + derived engines (loaded once)
//
// Everything the tree needs is memoised here, so views stay presentational.
import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { APP, DEFAULT_VIEW, STORAGE_KEYS, VIEWS } from '@/constants';
import { ACTION, archiveReducer, createInitialState } from './archiveReducer.js';
import { useHashRoute } from '@/hooks/useHashRoute.js';
import { useAnnouncer, useDocumentTitle } from '@/hooks/useAnnouncer.js';
import { readStoredValue, writeStoredValue } from '@/hooks/useLocalStorage.js';
import { createSearchIndex, filterReceipts, groupByChapter, toggleType } from '@/lib/filters.js';
import { DEFAULT_FILTERS } from '@/lib/url.js';
import { loadArchive } from '@/services/archiveService.js';
import { track } from '@/services/telemetry.js';

/** @type {import('react').Context<import('@/types').ArchiveStore|null>} */
export const ArchiveContext = createContext(null);
ArchiveContext.displayName = 'ArchiveContext';

/** Human titles per view — used for `document.title` and history entries. */
const VIEW_TITLES = {
  [VIEWS.COVER]: `${APP.name} — ${APP.tagline}`,
  [VIEWS.STORY]: `The Story · ${APP.name}`,
  [VIEWS.EXPLORE]: `Explorer · ${APP.name}`,
  [VIEWS.INSIGHTS]: `Patterns · ${APP.name}`,
};

/** Polite screen-reader copy per view (the visual change is obvious, this isn't). */
const VIEW_ANNOUNCEMENTS = {
  [VIEWS.STORY]: 'The Story. Eight chapters of receipts.',
  [VIEWS.EXPLORE]: 'Explorer. Search and filter every receipt.',
  [VIEWS.INSIGHTS]: 'Patterns. Statistics computed from the archive.',
};

/**
 * Provides the archive store to the tree.
 * @param {{ children: React.ReactNode }} props
 */
export function ArchiveProvider({ children }) {
  const archive = useMemo(() => loadArchive(), []);
  const [route, navigate] = useHashRoute();
  const [announcement, announce] = useAnnouncer();
  const [ui, dispatch] = useReducer(archiveReducer, undefined, () =>
    createInitialState({ lensOn: readStoredValue(STORAGE_KEYS.LENS, true) })
  );

  useDocumentTitle(VIEW_TITLES[route.view] ?? VIEW_TITLES[DEFAULT_VIEW]);

  // Announce view changes and remember the lens preference across reloads.
  useEffect(() => {
    if (VIEW_ANNOUNCEMENTS[route.view]) announce(VIEW_ANNOUNCEMENTS[route.view]);
  }, [route.view, announce]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.LENS, ui.lensOn);
  }, [ui.lensOn]);

  // ---- route actions (URL is the source of truth) -------------------------
  const goToView = useCallback(
    (view) => {
      track('view_open', { view });
      navigate({ view });
      dispatch({ type: ACTION.CLEAR_SELECTION });
    },
    [navigate]
  );

  const setFilters = useCallback(
    (partial) => {
      // `replace` keeps the back button on the previous *view* instead of
      // walking back through every keystroke of a search.
      navigate({ filters: { ...route.filters, ...partial } }, { replace: true });
    },
    [navigate, route.filters]
  );

  const setQuery = useCallback((query) => setFilters({ query }), [setFilters]);
  const setMonth = useCallback((month) => setFilters({ month }), [setFilters]);
  const toggleSort = useCallback(
    () => setFilters({ ascending: !route.filters.ascending }),
    [setFilters, route.filters.ascending]
  );
  const toggleTypeFilter = useCallback(
    (type) => setFilters({ types: toggleType(route.filters.types, type) }),
    [setFilters, route.filters.types]
  );
  const clearFilters = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), [setFilters]);

  // ---- modal / lens actions ----------------------------------------------
  const openReceipt = useCallback((receipt) => {
    if (!receipt) return;
    track('receipt_open', { id: receipt.id, type: receipt.type });
    dispatch({ type: ACTION.SELECT_RECEIPT, id: receipt.id });
  }, []);
  const closeReceipt = useCallback(() => dispatch({ type: ACTION.CLEAR_SELECTION }), []);
  const hoverReceipt = useCallback((id) => dispatch({ type: ACTION.HOVER_RECEIPT, id }), []);
  const toggleChapter = useCallback((id) => dispatch({ type: ACTION.TOGGLE_CHAPTER, id }), []);
  const toggleLens = useCallback(() => dispatch({ type: ACTION.SET_LENS, enabled: !ui.lensOn }), [ui.lensOn]);
  // ---- derived data (computed once per dependency change) -----------------
  const searchIndex = useMemo(() => createSearchIndex(archive.receipts), [archive.receipts]);

  const receiptById = useMemo(() => {
    const map = new Map();
    for (const r of archive.receipts) map.set(r.id, r);
    return map;
  }, [archive.receipts]);

  /** Receipts matching the current URL filters, sorted. Explorer's data source. */
  const visibleReceipts = useMemo(
    () => filterReceipts(archive.receipts, route.filters, searchIndex),
    [archive.receipts, route.filters, searchIndex]
  );

  /** Chapters with their receipts attached — The Story's data source. */
  const chaptersWithItems = useMemo(
    () => groupByChapter(archive.receipts, archive.chapters),
    [archive.receipts, archive.chapters]
  );

  const selectedReceipt = useMemo(
    () => (ui.selectedId ? (receiptById.get(ui.selectedId) ?? null) : null),
    [ui.selectedId, receiptById]
  );

  const selectedLinks = useMemo(
    () => (ui.selectedId ? (archive.linkMap[ui.selectedId] ?? []) : []),
    [ui.selectedId, archive.linkMap]
  );

  const value = useMemo(
    () => ({
      // data
      ...archive,
      // route
      view: route.view,
      filters: route.filters,
      goToView,
      enterArchive: () => goToView(VIEWS.STORY),
      setQuery,
      setMonth,
      toggleSort,
      toggleTypeFilter,
      clearFilters,
      navigate,
      // interaction state
      lensOn: ui.lensOn,
      toggleLens,
      selectedReceipt,
      selectedLinks,
      openReceipt,
      closeReceipt,
      hoveredId: ui.hoveredId,
      hoverReceipt,
      expandedChapters: ui.expandedChapters,
      toggleChapter,
      // derived
      visibleReceipts,
      chaptersWithItems,
      announcement,
      announce,
    }),
    [
      archive,
      route.view,
      route.filters,
      goToView,
      setQuery,
      setMonth,
      toggleSort,
      toggleTypeFilter,
      clearFilters,
      navigate,
      ui.lensOn,
      ui.hoveredId,
      ui.expandedChapters,
      toggleLens,
      selectedReceipt,
      selectedLinks,
      openReceipt,
      closeReceipt,
      hoverReceipt,
      toggleChapter,
      visibleReceipts,
      chaptersWithItems,
      announcement,
      announce,
    ]
  );

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}
