import { formatPercent } from '@/utils/format.js';

/** Chart geometry (kept in one place so the axis maths is easy to verify). */
const WIDTH = 320;
const HEIGHT = 70;
const PAD_X = 10;
const MOOD_MIN = 1;
const MOOD_MAX = 5;

/**
 * Converts monthly mood values (1–5, `null` for unknown) into SVG polylines.
 * Months without data become gaps between segments rather than a fake straight
 * line, which would misrepresent the year.
 * @param {(number|null)[]} moods
 * @returns {string[]} one point-string per contiguous segment
 */
export function moodSegments(moods) {
  const segments = [];
  let current = [];
  moods.forEach((mood, index) => {
    if (mood == null) {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
      return;
    }
    const x = PAD_X + (index / (moods.length - 1)) * (WIDTH - PAD_X * 2);
    const y = HEIGHT - 10 - ((mood - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * (HEIGHT - 20);
    current.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  });
  if (current.length > 1) segments.push(current.join(' '));
  return segments;
}

/**
 * The mood arc of the year.
 *
 * Accessibility: the SVG is `role="img"` with a generated label (trend + peak),
 * and the underlying monthly numbers are listed for screen readers.
 * @param {{ moods: (number|null)[], months: string[], average: number|null }} props
 */
export default function MoodArc({ moods, months, average }) {
  const segments = moodSegments(moods);
  const label = average
    ? `Mood arc across the year. Average mood ${average} out of 5. Monthly values follow.`
    : 'Mood arc across the year. Not enough mood data.';

  return (
    <figure className="ins-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mood-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} className="mood-axis" />
        {segments.map((points) => (
          <polyline
            key={points}
            points={points}
            fill="none"
            stroke="#c9754b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {segments.join(' ').split(/\s+/).filter(Boolean).length > 0 &&
          segments.map((segment) =>
            segment.split(' ').map((point) => {
              const [cx, cy] = point.split(',');
              return <circle key={`${segment}-${point}`} cx={cx} cy={cy} r="2.6" fill="#c9754b" />;
            })
          )}
      </svg>
      <div className="mood-labels" aria-hidden="true">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <ul className="sr-only">
        {moods.map((mood, index) => (
          <li key={months[index]}>
            {months[index]}:{' '}
            {mood == null ? 'no mood data' : `${mood} of 5 (${formatPercent(mood / MOOD_MAX)})`}
          </li>
        ))}
      </ul>
    </figure>
  );
}
