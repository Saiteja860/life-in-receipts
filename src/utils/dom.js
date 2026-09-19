// Browser-side helpers. Everything here is defensive: it must never throw in
// SSR-ish/test environments where `document` or `matchMedia` may be partial.

/** Selector for everything that can receive keyboard focus. */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * All focusable, visible descendants of `root`.
 * @param {HTMLElement|null|undefined} root
 * @returns {HTMLElement[]}
 */
export function getFocusable(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/** @returns {boolean} Whether the visitor asked for reduced motion. */
export function prefersReducedMotion() {
  return matchMediaSafe('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Safe `window.matchMedia` wrapper with a no-match fallback.
 * @param {string} query CSS media query
 * @returns {{ matches: boolean, addEventListener?: Function, removeEventListener?: Function }}
 */
export function matchMediaSafe(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { matches: false };
  }
  return window.matchMedia(query);
}

let scrollLockDepth = 0;
let previousOverflow = '';

/**
 * Reference-counted body scroll lock so nested overlays cannot unlock early.
 * @returns {() => void} release function
 */
export function lockScroll() {
  if (typeof document === 'undefined') return () => {};
  if (scrollLockDepth === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockDepth += 1;
  return () => {
    scrollLockDepth = Math.max(0, scrollLockDepth - 1);
    if (scrollLockDepth === 0) document.body.style.overflow = previousOverflow;
  };
}

/**
 * Moves focus without throwing when the node has already unmounted.
 * @param {HTMLElement|null|undefined} node
 * @param {FocusOptions} [options]
 */
export function focusSafely(node, options) {
  if (node && typeof node.focus === 'function') node.focus(options);
}

/**
 * Runs `callback` after the browser paints, or immediately when
 * `requestAnimationFrame` is unavailable (tests).
 * @param {() => void} callback
 * @returns {number} handle
 */
export function raf(callback) {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback);
  callback();
  return 0;
}

/**
 * Scrolls an element into view while respecting reduced-motion preferences.
 * @param {string} elementId
 */
export function scrollToId(elementId) {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(elementId);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/**
 * True when the environment can observe intersections (guards older browsers).
 * @returns {boolean}
 */
export function supportsIntersectionObserver() {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}
