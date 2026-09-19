import { useEffect, useState } from 'react';
import { matchMediaSafe } from '@/utils/dom.js';

/**
 * Subscribes to a CSS media query from React.
 *
 * Used for behaviour that CSS alone cannot express (e.g. disabling the hover
 * lens on touch devices, deferring heavy grids on small screens), while CSS
 * still owns all *visual* responsiveness.
 *
 * @param {string} query e.g. `(min-width: 720px)`
 * @returns {boolean} whether the query currently matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => matchMediaSafe(query).matches);

  useEffect(() => {
    const mql = matchMediaSafe(query);
    setMatches(mql.matches);
    if (!mql.addEventListener) return undefined;

    const onChange = (event) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Convenience wrapper: does the visitor prefer reduced motion? */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Convenience wrapper: is there a real pointer (mouse/trackpad) available? */
export function useHasHover() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/** Convenience wrapper: compact viewport (≤ 720px), mirrors the CSS breakpoint. */
export function useIsCompactViewport() {
  return useMediaQuery('(max-width: 720px)');
}
