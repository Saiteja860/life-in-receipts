import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reads a JSON value from localStorage without ever throwing (private mode,
 * disabled storage and quota errors are all swallowed).
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function readStoredValue(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Writes a JSON value to localStorage, ignoring failures.
 * @param {string} key
 * @param {*} value
 * @returns {boolean} whether the write succeeded
 */
export function writeStoredValue(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * `useState` that survives reloads. Preferences like the Connection Lens
 * toggle are remembered, but the state stays local-first: a failed write
 * degrades to plain in-memory state instead of breaking the UI.
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue));
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    writeStoredValue(keyRef.current, value);
  }, [value]);

  const set = useCallback((next) => setValue(next), []);
  return [value, set];
}
