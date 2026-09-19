import { useEffect, useMemo, useState } from 'react';
import { APP } from '@/constants';
import { formatCompactCurrency, pluralize } from '@/utils/format.js';

/** Lines the cover "prints" before it lets you in. */
const SCAN_LINES = [
  `${APP.year} records found in the archive…`,
  'music · movies · places · purchases · photos',
  'messages · searches · events · notes',
  'scanning for meaning…',
];

/**
 * The cover: the archive introducing itself as a decoding terminal.
 *
 * Accessibility: with `prefers-reduced-motion` the decoding sequence is skipped
 * entirely (all lines appear at once and the CTA is enabled immediately), so the
 * decorative animation never gates anybody's entry into the content.
 *
 * @param {{
 *   stats: { total: number, totalEvents: number, totalSpend: number },
 *   onEnter: () => void,
 *   reduceMotion?: boolean,
 * }} props
 */
export default function Cover({ stats, onEnter, reduceMotion = false }) {
  const lines = useMemo(() => SCAN_LINES, []);
  const [shown, setShown] = useState(reduceMotion ? lines.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(lines.length);
      return undefined;
    }
    if (shown >= lines.length) return undefined;
    const timer = setTimeout(() => setShown((count) => count + 1), 520);
    return () => clearTimeout(timer);
  }, [shown, lines.length, reduceMotion]);

  const ready = shown >= lines.length;

  return (
    <section className="cover" aria-labelledby="cover-title">
      <div className="cover-inner">
        <p className="cover-kicker">THE DIGITAL LIFE ARCHIVE · ONE YEAR · ONE PERSON</p>
        <h1 className="cover-title" id="cover-title">
          Your Life,
          <br />
          <em>In Receipts</em>
        </h1>
        <p className="cover-sub">
          A year of someone's digital life, printed on {pluralize(stats.total, 'little receipt')}.
          Individually, they mean almost nothing. Together, they mean everything.
        </p>

        <div className="cover-scan" role="status" aria-live="polite">
          {lines.slice(0, shown).map((line) => (
            <p key={line} className="scanline">
              {line}
            </p>
          ))}
          {!ready && <p className="scanline scan-cursor">▌</p>}
        </div>

        <button type="button" className="cover-cta" onClick={onEnter} disabled={!ready}>
          {ready ? 'unwrap the archive →' : 'decoding…'}
        </button>
        {!ready && <p className="sr-only">The archive is still decoding. The button enables in a moment.</p>}

        <div className="cover-stats">
          <div>
            <strong>{stats.total}</strong>
            <span>receipts</span>
          </div>
          <div>
            <strong>{stats.totalEvents}</strong>
            <span>events</span>
          </div>
          <div>
            <strong>{formatCompactCurrency(stats.totalSpend)}</strong>
            <span>spent</span>
          </div>
          <div>
            <strong>{APP.chapters}</strong>
            <span>chapters</span>
          </div>
        </div>
      </div>
      <div className="cover-shred" aria-hidden="true" />
    </section>
  );
}
