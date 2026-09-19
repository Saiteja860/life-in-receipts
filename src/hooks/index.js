// Public hook surface. Views import from `@/hooks`, never from deep paths.
export { useAnnouncer, useDocumentTitle } from './useAnnouncer.js';
export { useDebouncedValue } from './useDebouncedValue.js';
export { useEscapeKey } from './useEscapeKey.js';
export { useFocusTrap } from './useFocusTrap.js';
export { useHashRoute } from './useHashRoute.js';
export { useIncrementalReveal } from './useIncrementalReveal.js';
export { readStoredValue, useLocalStorage, writeStoredValue } from './useLocalStorage.js';
export {
  useHasHover,
  useIsCompactViewport,
  useMediaQuery,
  usePrefersReducedMotion,
} from './useMediaQuery.js';
