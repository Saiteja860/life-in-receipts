import { useCallback, useEffect, useRef, useState } from 'react';
import { buildHash, filtersEqual, parseHash } from '@/lib/url.js';
import { DEFAULT_FILTERS } from '@/lib/url.js';
import { VIEWS } from '@/constants';

/**
 * Reads a hash on first paint. An empty hash means "cold entry" → the Cover,
 * which is the one place we *do* want the decoding sequence.
 * Exported so the store can seed itself from exactly the same rule the hook
 * uses (no duplicated parsing logic).
 * @returns {{ view: string, filters: typeof DEFAULT_FILTERS }}
 */
export function readInitialRoute() {
  if (typeof window === 'undefined') return { view: VIEWS.COVER, filters: { ...DEFAULT_FILTERS } };
  const { view, filters } = parseHash(window.location.hash);
  return { view: window.location.hash ? view : VIEWS.COVER, filters };
}

/**
 * Two-way binding between React state and `location.hash`.
 *
 * Why a hash router instead of a library: the app has four screens and a
 * handful of filter params — 40 lines of `hashchange` plumbing beats shipping
 * a router, and every filtered view becomes shareable + bookmarkable
 * (`#/explore?q=bench&month=6`), including working browser back/forward.
 *
 * @returns {[ { view: string, filters: typeof DEFAULT_FILTERS }, (next: { view?: string, filters?: object }, options?: { replace?: boolean }) => void ]}
 */
export function useHashRoute() {
  const [route, setRoute] = useState(readInitialRoute);
  const routeRef = useRef(route);
  routeRef.current = route;

  // state → URL (guard against echo loops when the change came from the URL)
  const navigate = useCallback((next, options = {}) => {
    const { replace = false } = options;
    setRoute((current) => {
      const view = next.view ?? current.view;
      const filters = next.filters ? { ...DEFAULT_FILTERS, ...next.filters } : current.filters;
      if (view === current.view && filtersEqual(filters, current.filters)) return current;

      const hash = buildHash(view, filters);
      if (typeof window !== 'undefined' && window.location.hash !== hash) {
        const method = replace ? 'replaceState' : 'pushState';
        window.history[method](null, '', hash);
      }
      return { view, filters };
    });
  }, []);

  // URL → state (back/forward buttons, hand-edited hashes, shared links)
  useEffect(() => {
    const sync = () => {
      const next = readInitialRoute();
      const current = routeRef.current;
      if (next.view === current.view && filtersEqual(next.filters, current.filters)) return;
      setRoute(next);
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  return [route, navigate];
}
