import { padNumber, pluralize } from '@/utils/format.js';

/**
 * 24-cell heat strip showing when the year happened.
 *
 * The cells are decorative (opacity encodes volume); the numeric equivalent is
 * published as a hidden list, and each cell carries a title for pointer users.
 * @param {{ bins: number[], label: string }} props
 */
export default function HourHeatStrip({ bins, label }) {
  const max = Math.max(...bins, 1);
  const peakHour = bins.indexOf(max);

  return (
    <figure className="ins-chart">
      <figcaption className="sr-only">
        {label}. Peak hour: {padNumber(peakHour)}:00 with {pluralize(max, 'receipt')}.
      </figcaption>
      <div className="heat-strip" aria-hidden="true">
        {bins.map((value, hour) => (
          <div
            key={padNumber(hour)}
            className="heat-cell"
            title={`${padNumber(hour)}:00 — ${pluralize(value, 'receipt')}`}
            style={{ opacity: 0.15 + (value / max) * 0.85 }}
          />
        ))}
      </div>
      <div className="mood-labels" aria-hidden="true">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
      <ul className="sr-only">
        {bins.map((value, hour) => (
          <li key={padNumber(hour)}>
            {padNumber(hour)}:00 — {pluralize(value, 'receipt')}
          </li>
        ))}
      </ul>
    </figure>
  );
}
