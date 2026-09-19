import { formatCurrency } from '@/utils/format.js';

/**
 * Spending by month, as a 12-column CSS bar chart.
 *
 * The bars are decorative; the same data is published as a visually hidden list
 * so a screen reader can read the year out month by month.
 * @param {{ values: number[], months: string[], unit?: (value: number) => string, caption: string }} props
 */
export default function MonthBars({ values, months, unit = formatCurrency, caption }) {
  const max = Math.max(...values, 1);

  return (
    <figure className="ins-chart">
      <figcaption className="sr-only">{caption}</figcaption>
      <div className="chart-bars" aria-hidden="true">
        {values.map((value, index) => (
          <div className="bar-col" key={months[index] ?? index}>
            <div className="bar" style={{ height: `${Math.max((value / max) * 100, 2)}%` }} />
            <span>{months[index]}</span>
          </div>
        ))}
      </div>
      <ul className="sr-only">
        {values.map((value, index) => (
          <li key={months[index] ?? index}>
            {months[index]}: {unit(value)}
          </li>
        ))}
      </ul>
    </figure>
  );
}
