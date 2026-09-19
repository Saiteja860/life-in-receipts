// All UI state transitions for the archive, as one pure function.
//
// Design note: view + filters deliberately do NOT live here — they live in the
// URL (`@/hooks/useHashRoute`), which makes every filtered view shareable and
// makes browser back/forward work for free. This reducer owns only transient
// interaction state, which is exactly why it can be unit-tested in isolation.
import { LIMITS } from '@/constants';

/** Action type constants (no string literals in call sites). */
export const ACTION = {
  SET_LENS: 'ui/set-lens',
  SELECT_RECEIPT: 'ui/select-receipt',
  CLEAR_SELECTION: 'ui/clear-selection',
  HOVER_RECEIPT: 'ui/hover-receipt',
  TOGGLE_CHAPTER: 'ui/toggle-chapter',
  RESET: 'ui/reset',
};

/**
 * Creates the initial UI state, optionally seeded (tests, deep links).
 * @param {Partial<import('@/types').ArchiveState>} [overrides]
 * @returns {import('@/types').ArchiveState}
 */
export function createInitialState(overrides = {}) {
  return {
    lensOn: true,
    selectedId: null,
    hoveredId: null,
    expandedChapters: [],
    ...overrides,
  };
}

/**
 * @param {import('@/types').ArchiveState} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {import('@/types').ArchiveState}
 */
export function archiveReducer(state, action) {
  switch (action.type) {
    case ACTION.SET_LENS:
      return state.lensOn === action.enabled ? state : { ...state, lensOn: action.enabled, hoveredId: null };

    case ACTION.SELECT_RECEIPT:
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id };

    case ACTION.CLEAR_SELECTION:
      return state.selectedId === null ? state : { ...state, selectedId: null };

    case ACTION.HOVER_RECEIPT:
      return state.hoveredId === action.id ? state : { ...state, hoveredId: action.id };

    case ACTION.TOGGLE_CHAPTER: {
      const open = state.expandedChapters.includes(action.id);
      return {
        ...state,
        expandedChapters: open
          ? state.expandedChapters.filter((id) => id !== action.id)
          : [...state.expandedChapters, action.id],
      };
    }

    case ACTION.ANNOUNCE:
      return state.announcement === action.message ? state : { ...state, announcement: action.message };

    case ACTION.RESET:
      return createInitialState();

    default:
      // Unknown actions are ignored on purpose: a stray dispatch must never
      // blank the archive.
      return state;
  }
}

/**
 * Selector: is a chapter expanded past its preview?
 * @param {import('@/types').ArchiveState} state
 * @param {string} chapterId
 * @returns {boolean}
 */
export function isChapterExpanded(state, chapterId) {
  return state.expandedChapters.includes(chapterId);
}

/**
 * Selector: how many cards of a chapter to render.
 * @param {import('@/types').ArchiveState} state
 * @param {string} chapterId
 * @param {number} total
 * @returns {number}
 */
export function chapterPreviewSize(state, chapterId, total) {
  return isChapterExpanded(state, chapterId) ? total : Math.min(total, LIMITS.CHAPTER_PREVIEW);
}
