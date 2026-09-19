import { percentOf } from '@/utils/format.js';

/**
 * A labelled horizontal bar.
 *
 * Accessibility: the visual bar is decorative (`aria-hidden`), and the same
 * number is exposed as text inside the row, so the value is never available
 * *only* as a colour/width cue.
 * @param {{ label: string, value: number, max: number, color: string, suffix?: string }} props
 */
export default function BarMeter({ label, value, max, color, suffix }) {
  const width = percentOf(value, max);
  return (
    <div className="chart-row">
      <span className="chart-label" title={label}>
        {label}
      </span>
      <div className="chart-track" aria-hidden="true">
        <div className="chart-fill" style={{ width: `${Math.max(width, 2)}%`, background: color }} />
      </div>
      <span className="chart-val">{suffix ?? value}</span>
    </div>
  );
}
