import { describe, expect, it, vi } from 'vitest';
import { addTelemetrySink, track, trackError, trackWarning } from '@/services/telemetry.js';
import { rateMetric, THRESHOLDS } from '@/lib/perf.js';

describe('telemetry seam', () => {
  it('forwards events to every registered sink', () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = addTelemetrySink(a);
    const offB = addTelemetrySink(b);

    track('receipt_open', { id: 'r001' });

    expect(a).toHaveBeenCalledWith('receipt_open', { id: 'r001' });
    expect(b).toHaveBeenCalledWith('receipt_open', { id: 'r001' });

    offA();
    offB();
    track('after_unsubscribe');
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('never lets a broken sink break the app', () => {
    const off = addTelemetrySink(() => {
      throw new Error('sink exploded');
    });
    expect(() => track('still_alive')).not.toThrow();
    off();
  });

  it('labels warnings and errors consistently', () => {
    const sink = vi.fn();
    const off = addTelemetrySink(sink);

    trackWarning('dataset_invalid', { errors: ['x'] });
    expect(sink).toHaveBeenCalledWith('warning', { message: 'dataset_invalid', errors: ['x'] });

    trackError(new Error('render blew up'), { scope: 'ErrorBoundary', componentStack: 'a\nb\nc\nd' });
    const [, payload] = sink.mock.calls[1];
    expect(payload.scope).toBe('ErrorBoundary');
    expect(payload.message).toBe('render blew up');
    expect(payload.componentStack).toBe('a | b | c');

    off();
  });
});

describe('web-vitals rating bands', () => {
  it('rates metrics against the published thresholds', () => {
    expect(rateMetric('LCP', 1200)).toBe('good');
    expect(rateMetric('LCP', 3000)).toBe('needs-improvement');
    expect(rateMetric('LCP', 9000)).toBe('poor');
    expect(rateMetric('unknown-metric', 1)).toBe('good');
    expect(THRESHOLDS.CLS[0]).toBe(0.1);
  });
});
