// Web-vitals instrumentation, hand-rolled on top of the PerformanceObserver API.
//
// Why not the `web-vitals` package: we need five metrics observed once, and the
// library would add a dependency for ~60 lines of `PerformanceObserver` code.
// Metrics are reported through the telemetry seam, so they are visible in dev
// (`console.debug`) and can be pointed at a real endpoint via `VITE_TELEMETRY`.
import { track } from '@/services/telemetry.js';

/**
 * "Good / needs improvement / poor" bands — the published Core Web Vitals
 * thresholds, so the numbers in `docs/PERFORMANCE.md` mean the same thing as
 * they do in Lighthouse.
 */
export const THRESHOLDS = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

/**
 * @param {string} name
 * @param {number} value
 * @returns {'good'|'needs-improvement'|'poor'}
 */
export function rateMetric(name, value) {
  const [good, poor] = THRESHOLDS[name] ?? [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Registers an observer defensively — unsupported entry types must not throw.
 * @param {string} type
 * @param {(entries: PerformanceEntry[]) => void} handler
 */
function observe(type, handler) {
  try {
    const observer = new PerformanceObserver((list) => handler(list.getEntries()));
    observer.observe({ type, buffered: true });
    return observer;
  } catch {
    return null;
  }
}

/**
 * Starts measuring Core Web Vitals. Safe to call in any environment: in a
 * non-browser (or in jsdom) it simply does nothing.
 *
 * @param {(metric: import('@/types').PerfMetric) => void} [onMetric] Defaults to telemetry.
 * @returns {() => void} stop function
 */
export function reportWebVitals(onMetric = (metric) => track('web_vital', metric)) {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return () => {};

  /** @type {PerformanceObserver[]} */
  const observers = [];

  const emit = (name, value) => {
    if (!Number.isFinite(value)) return;
    onMetric({ name, value: Math.round(value * 100) / 100, rating: rateMetric(name, value) });
  };

  // LCP — largest contentful paint (reported on the latest candidate).
  let lcp = 0;
  observers.push(
    observe('largest-contentful-paint', (entries) => {
      const last = entries[entries.length - 1];
      if (last) lcp = last.startTime;
    })
  );

  // CLS — cumulative layout shift, excluding shifts right after user input.
  let cls = 0;
  observers.push(
    observe('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!entry.hadRecentInput) cls += entry.value;
      }
    })
  );

  // INP proxy — the worst interaction latency observed.
  let inp = 0;
  observers.push(
    observe('event', (entries) => {
      for (const entry of entries) {
        if (entry.interactionId) inp = Math.max(inp, entry.duration);
      }
    })
  );

  // FCP + TTFB come from paint/navigation timing.
  observers.push(
    observe('paint', (entries) => {
      const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcp) emit('FCP', fcp.startTime);
    })
  );
  observers.push(
    observe('navigation', (entries) => {
      const nav = entries[0];
      if (nav) emit('TTFB', nav.responseStart);
    })
  );

  const flush = () => {
    emit('LCP', lcp);
    emit('CLS', cls);
    if (inp) emit('INP', inp);
  };

  // `visibilitychange` → hidden is the moment the values stop changing.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);

  return () => {
    for (const observer of observers) observer?.disconnect();
    flush();
  };
}
