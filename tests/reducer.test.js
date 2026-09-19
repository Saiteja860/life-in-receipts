import { describe, expect, it } from 'vitest';
import {
  ACTION,
  archiveReducer,
  chapterPreviewSize,
  createInitialState,
  isChapterExpanded,
} from '@/context/archiveReducer.js';
import { LIMITS } from '@/constants';

describe('archive reducer (UI state)', () => {
  it('starts with the lens on and nothing selected', () => {
    const state = createInitialState();
    expect(state).toEqual({ lensOn: true, selectedId: null, hoveredId: null, expandedChapters: [] });
  });

  it('accepts seed values', () => {
    expect(createInitialState({ lensOn: false }).lensOn).toBe(false);
  });

  it('toggles the lens and clears any hover in the same transition', () => {
    const hovered = archiveReducer(createInitialState(), { type: ACTION.HOVER_RECEIPT, id: 'r001' });
    const off = archiveReducer(hovered, { type: ACTION.SET_LENS, enabled: false });
    expect(off.lensOn).toBe(false);
    expect(off.hoveredId).toBeNull();
  });

  it('returns the identical state object when nothing changes (no wasted renders)', () => {
    const state = createInitialState();
    expect(archiveReducer(state, { type: ACTION.SET_LENS, enabled: true })).toBe(state);
    expect(archiveReducer(state, { type: ACTION.HOVER_RECEIPT, id: null })).toBe(state);
    expect(archiveReducer(state, { type: ACTION.CLEAR_SELECTION })).toBe(state);
    expect(archiveReducer(state, { type: ACTION.HOVER_RECEIPT, id: null })).toBe(state);
  });

  it('tracks the open receipt', () => {
    const opened = archiveReducer(createInitialState(), { type: ACTION.SELECT_RECEIPT, id: 'r009' });
    expect(opened.selectedId).toBe('r009');
    expect(archiveReducer(opened, { type: ACTION.CLEAR_SELECTION }).selectedId).toBeNull();
  });

  it('expands and folds chapters independently', () => {
    let state = createInitialState();
    state = archiveReducer(state, { type: ACTION.TOGGLE_CHAPTER, id: 'a1' });
    state = archiveReducer(state, { type: ACTION.TOGGLE_CHAPTER, id: 'a3' });
    expect(state.expandedChapters).toEqual(['a1', 'a3']);
    expect(isChapterExpanded(state, 'a1')).toBe(true);
    expect(isChapterExpanded(state, 'a2')).toBe(false);

    state = archiveReducer(state, { type: ACTION.TOGGLE_CHAPTER, id: 'a1' });
    expect(state.expandedChapters).toEqual(['a3']);
  });

  it('caps the chapter preview until it is expanded', () => {
    const collapsed = createInitialState();
    const total = LIMITS.CHAPTER_PREVIEW + 12;
    expect(chapterPreviewSize(collapsed, 'a1', total)).toBe(LIMITS.CHAPTER_PREVIEW);
    expect(chapterPreviewSize(collapsed, 'a1', 3)).toBe(3);

    const expanded = archiveReducer(collapsed, { type: ACTION.TOGGLE_CHAPTER, id: 'a1' });
    expect(chapterPreviewSize(expanded, 'a1', total)).toBe(total);
  });

  it('resets back to the initial state', () => {
    const dirty = archiveReducer(createInitialState({ lensOn: false }), {
      type: ACTION.SELECT_RECEIPT,
      id: 'r002',
    });
    expect(archiveReducer(dirty, { type: ACTION.RESET })).toEqual(createInitialState());
  });

  it('ignores unknown actions instead of blanking the UI', () => {
    const state = createInitialState({ selectedId: 'r003' });
    expect(archiveReducer(state, { type: 'nonsense/action' })).toBe(state);
  });
});
