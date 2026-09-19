// Observability seam. One tiny module so instrumentation can be added, swapped
// or silenced in exactly one place — no `console.log` scattered through views.
//
// In development every event is printed for debuggability; in production the
// sink is a no-op unless `VITE_TELEMETRY=on` is set at build time (which is also
// the hook where a real endpoint/Web-Vitals beacon would be wired in).
const isDev = Boolean(import.meta.env?.DEV);
const explicitlyOn = import.meta.env?.VITE_TELEMETRY === 'on';

/** @type {((event: string, payload?: Record<string, unknown>) => void)[]} */
const sinks = [];

/**
 * Registers an additional sink (e.g. a test spy or a real endpoint).
 * @param {(event: string, payload?: Record<string, unknown>) => void} sink
 * @returns {() => void} unsubscribe
 */
export function addTelemetrySink(sink) {
  sinks.push(sink);
  return () => {
    const i = sinks.indexOf(sink);
    if (i >= 0) sinks.splice(i, 1);
  };
}

/**
 * Records a product event.
 * @param {string} event snake_case event name
 * @param {Record<string, unknown>} [payload] small, non-identifying payload
 */
export function track(event, payload) {
  for (const sink of sinks) {
    try {
      sink(event, payload);
    } catch {
      /* a broken sink must never break the UI */
    }
  }
  if (isDev) console.debug(`[telemetry] ${event}`, payload ?? {});
  else if (explicitlyOn && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    // Deliberately fire-and-forget: analytics must not delay a frame.
    try {
      navigator.sendBeacon('/__telemetry', JSON.stringify({ event, payload }));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Records a recoverable problem (bad dataset, missing link, render fallback).
 * @param {string} message
 * @param {Record<string, unknown>} [context]
 */
export function trackWarning(message, context) {
  track('warning', { message, ...context });
}

/**
 * Records an unexpected error together with an ErrorBoundary `componentStack`.
 * @param {Error} error
 * @param {{ componentStack?: string, scope?: string }} [context]
 */
export function trackError(error, context = {}) {
  track('error', {
    message: error?.message ?? String(error),
    scope: context.scope ?? 'unknown',
    componentStack: context.componentStack?.split('\n').slice(0, 3).join(' | '),
  });
}
