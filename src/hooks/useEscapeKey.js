import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when Escape is pressed while `active`.
 * The handler is read from a ref so callers can pass an inline arrow function
 * without re-binding the listener on every render.
 * @param {() => void} handler
 * @param {boolean} [active=true]
 */
export function useEscapeKey(handler, active = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.stopPropagation();
        handlerRef.current?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
