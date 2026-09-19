import { useEffect, useState } from 'react';

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 * Used to keep the URL (and therefore history) from thrashing on every
 * keystroke while the in-memory filter result stays instant.
 * @template T
 * @param {T} value
 * @param {number} [delay=250]
 * @returns {T}
 */
export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
