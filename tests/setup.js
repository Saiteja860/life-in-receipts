// Global test environment.
//
// jsdom implements the DOM but not the browser APIs this app leans on, so every
// gap is filled here once instead of being mocked per test file.
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/** Minimal, controllable `matchMedia` stub (defaults to "no preferences"). */
function createMatchMedia(matches = false) {
  return vi.fn((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

/**
 * Replaces `window.matchMedia` with a stub driven by a predicate, so a test can
 * act like a phone, a reduced-motion user, or a high-contrast user.
 * @param {(query: string) => boolean} predicate
 */
export function mockMatchMedia(predicate = () => false) {
  window.matchMedia = vi.fn((query) => ({
    matches: Boolean(predicate(query)),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

if (!window.matchMedia) window.matchMedia = createMatchMedia();

/** IntersectionObserver stub that reports immediately-visible elements. */
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(target) {
    this.callback([{ isIntersecting: true, target }], this);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
window.IntersectionObserver = MockIntersectionObserver;
globalThis.IntersectionObserver = MockIntersectionObserver;

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn();

if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});
