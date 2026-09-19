import { useCallback, useEffect, useRef, useState } from 'react';
import { LIMITS } from '@/constants';

/**
 * Screen-reader announcement channel.
 *
 * Route changes and filter results are silent for assistive tech, so this hook
 * keeps one polite message with a self-clearing timer. Consumers render it
 * inside a `role="status"` / `aria-live="polite"` region (`<Announcer />`).
 *
 * @returns {[string, (message: string) => void]}
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const timerRef = useRef(/** @type {ReturnType<typeof setTimeout>|null} */ (null));

  const announce = useCallback((next) => {
    if (!next) return;
    setMessage(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(''), LIMITS.ANNOUNCE_TTL);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return [message, announce];
}

/**
 * Keeps `document.title` in sync with the active view (history entries and
 * browser tabs become meaningful, which screen readers also read out).
 * @param {string} title
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (typeof document === 'undefined' || !title) return;
    document.title = title;
  }, [title]);
}
