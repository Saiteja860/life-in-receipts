import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIMITS } from '@/constants';
import { supportsIntersectionObserver } from '@/utils/dom.js';

/**
 * Progressive rendering for long grids.
 *
 * 163 receipt cards is enough DOM to matter on a mid-range phone, so the first
 * batch renders immediately and the rest mount in batches as a sentinel scrolls
 * into view. Where `IntersectionObserver` is unavailable we render everything
 * at once and expose `hasMore === false`, so nothing is ever hidden behind a
 * feature the browser lacks.
 *
 * @param {number} total Number of items the consumer wants to render
 * @param {{ batch?: number, disabled?: boolean }} [options]
 * @returns {{ visibleCount: number, sentinelRef: (node: HTMLElement|null) => void, hasMore: boolean, revealMore: () => void }}
 */
export function useIncrementalReveal(total, options = {}) {
  const { batch = LIMITS.REVEAL_BATCH, disabled = false } = options;
  const canObserve = useMemo(() => !disabled && supportsIntersectionObserver(), [disabled]);
  const [visibleCount, setVisibleCount] = useState(() => (canObserve ? batch : total));
  const observerRef = useRef(/** @type {IntersectionObserver|null} */ (null));

  // A new result set (e.g. a new search) restarts the reveal window.
  useEffect(() => {
    setVisibleCount(canObserve ? Math.min(batch, total) : total);
  }, [total, batch, canObserve]);

  const revealMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + batch, total));
  }, [batch, total]);

  const sentinelRef = useCallback(
    (node) => {
      observerRef.current?.disconnect();
      if (!node || !canObserve) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) revealMore();
        },
        { rootMargin: '400px 0px' }
      );
      observerRef.current.observe(node);
    },
    [canObserve, revealMore]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return {
    visibleCount: Math.min(visibleCount, total),
    sentinelRef,
    hasMore: canObserve && visibleCount < total,
    revealMore,
  };
}
