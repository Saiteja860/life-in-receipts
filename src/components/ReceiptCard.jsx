import { memo } from 'react';
import { CHAPTER_MAP, TYPE_META } from '@/data/chapters.js';
import { CSS_VARS, TILT } from '@/constants';
import { formatDate, formatTime } from '@/utils/format.js';
import ReceiptRows from './ReceiptRows.jsx';

/**
 * Deterministic "hand-printed" tilt for a receipt.
 *
 * A hash of the id (not `Math.random`) means every render — and every device —
 * places a card at the same angle, so the grid looks intentional and no layout
 * jitter is possible on re-render.
 *
 * @param {string} id
 * @returns {number} degrees
 */
export function tiltOf(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * TILT.HASH_MULTIPLIER + id.charCodeAt(i)) | 0;
  }
  return ((hash % TILT.SPREAD) - TILT.HALF) * TILT.STEP;
}

/** Decorative CSS barcode — always hidden from assistive tech. */
function Barcode({ large = false }) {
  return <div className={large ? 'barcode barcode-lg' : 'barcode'} aria-hidden="true" />;
}

/**
 * A single receipt rendered as a thermal-printer artefact.
 *
 * Interaction contract:
 *  • click / Enter  → open its thread modal
 *  • hover          → focus the Connection Lens (pointer devices)
 *  • focus          → focus the Connection Lens (keyboard users, same feature)
 *
 * Wrapped in `React.memo`: with 163 cards on screen, the lens re-renders the
 * whole grid on every hover, and only the two affected cards ever change.
 *
 * @param {{
 *   receipt: import('@/types').Receipt,
 *   onOpen: (receipt: import('@/types').Receipt) => void,
 *   lensActive?: boolean,
 *   dimmed?: boolean,
 *   linked?: boolean,
 *   onHoverChange?: (id: string|null) => void,
 * }} props
 */
export function ReceiptCard({
  receipt,
  onOpen,
  lensActive = false,
  dimmed = false,
  linked = false,
  onHoverChange,
}) {
  const type = TYPE_META[receipt.type];
  const chapter = CHAPTER_MAP[receipt.arc];
  const classes = ['receipt-card'];
  if (lensActive && dimmed) classes.push('is-dimmed');
  if (lensActive && linked) classes.push('is-linked');

  const handleLens = (id) => {
    if (lensActive && onHoverChange) onHoverChange(id);
  };

  return (
    <button
      type="button"
      className={classes.join(' ')}
      style={{
        [CSS_VARS.TILT]: `${tiltOf(receipt.id)}deg`,
        [CSS_VARS.INK]: type.ink,
        [CSS_VARS.CHAPTER]: chapter.color,
      }}
      onClick={() => onOpen(receipt)}
      onMouseEnter={() => handleLens(receipt.id)}
      onMouseLeave={() => handleLens(null)}
      onFocus={() => handleLens(receipt.id)}
      onBlur={() => handleLens(null)}
    >
      <div className="rc-head">
        <span className="rc-type">
          {type.icon} {type.label.toUpperCase()}
        </span>
        <span className="rc-id">#{receipt.id.slice(1)}</span>
      </div>
      <div className="rc-title">{receipt.title}</div>
      <div className="rc-divider" />
      <ReceiptRows receipt={receipt} />
      <div className="rc-divider" />
      <div className="rc-foot">
        <span>{formatDate(receipt.ts)}</span>
        <span>{formatTime(receipt.ts)}</span>
      </div>
      <span className="sr-only">— open this receipt's threads</span>
      <Barcode />
    </button>
  );
}

export default memo(ReceiptCard);
