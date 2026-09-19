import { useEffect, useRef } from 'react';
import { focusSafely, getFocusable } from '@/utils/dom.js';

/**
 * Traps Tab/Shift+Tab inside a container while `active`, and restores focus to
 * whatever was focused before the trap opened.
 *
 * This is what turns the receipt modal from "has role=dialog" into a genuinely
 * modal dialog for keyboard and screen-reader users: without it, Tab walks into
 * the page behind the overlay.
 *
 * @param {{ current: HTMLElement|null }} containerRef
 * @param {boolean} active
 * @param {HTMLElement|null} [initialFocusRef]
 */
export function useFocusTrap(containerRef, active, initialFocusRef) {
  const previouslyFocused = useRef(/** @type {HTMLElement|null} */ (null));

  useEffect(() => {
    if (!active) return undefined;
    previouslyFocused.current = /** @type {HTMLElement} */ (document.activeElement);

    // Move focus into the dialog on the next tick so the node exists.
    focusSafely(initialFocusRef?.current ?? getFocusable(containerRef.current)[0]);

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(containerRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !containerRef.current?.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      focusSafely(previouslyFocused.current);
    };
  }, [active, containerRef, initialFocusRef]);
}
