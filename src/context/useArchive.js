// Typed-ish context consumers. Views call these instead of importing the
// context object directly, so the "provider missing" failure is a clear error.
import { useContext } from 'react';
import { ArchiveContext } from './ArchiveProvider.jsx';

/**
 * Full archive store (data + route + UI state + derived views).
 * @returns {import('@/types').ArchiveStore}
 */
export function useArchive() {
  const store = useContext(ArchiveContext);
  if (!store) {
    throw new Error('useArchive() must be used inside <ArchiveProvider>. Check src/main.jsx.');
  }
  return store;
}

/** Route + filter slice only — useful for components that never touch receipts. */
export function useRoute() {
  const { view, filters, goToView, setQuery, setMonth, toggleSort, toggleTypeFilter, clearFilters } =
    useArchive();
  return { view, filters, goToView, setQuery, setMonth, toggleSort, toggleTypeFilter, clearFilters };
}

/** Connection Lens slice: toggle, hover and the selected receipt's threads. */
export function useConnections() {
  const {
    lensOn,
    toggleLens,
    hoveredId,
    hoverReceipt,
    selectedReceipt,
    selectedLinks,
    openReceipt,
    closeReceipt,
  } = useArchive();
  return {
    lensOn,
    toggleLens,
    hoveredId,
    hoverReceipt,
    selectedReceipt,
    selectedLinks,
    openReceipt,
    closeReceipt,
  };
}
