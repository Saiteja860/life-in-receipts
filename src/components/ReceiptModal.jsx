import { useEffect, useRef } from 'react';
import { CHAPTER_MAP, TYPE_META } from '@/data/chapters.js';
import { useEscapeKey, useFocusTrap } from '@/hooks';
import { formatLongDate, formatTime } from '@/utils/format.js';
import { lockScroll } from '@/utils/dom.js';
import ReceiptCard from './ReceiptCard.jsx';
import ReceiptRows from './ReceiptRows.jsx';

/**
 * Thread modal: one receipt, printed large, plus every receipt it connects to.
 *
 * Accessibility contract (all four points are enforced by the hooks, not by
 * convention): `role="dialog"` + `aria-modal`, focus moves in on open, Tab is
 * trapped inside, Escape closes, and focus returns to the card that opened it.
 *
 * @param {{
 *   receipt: import('@/types').Receipt|null,
 *   links: import('@/types').Link[],
 *   onClose: () => void,
 *   onOpen: (receipt: import('@/types').Receipt) => void,
 * }} props
 */
export default function ReceiptModal({ receipt, links, onClose, onOpen }) {
  const panelRef = useRef(/** @type {HTMLDivElement|null} */ (null));
  const closeRef = useRef(/** @type {HTMLButtonElement|null} */ (null));
  const open = Boolean(receipt);

  useFocusTrap(panelRef, open, closeRef);
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return undefined;
    return lockScroll();
  }, [open]);

  if (!receipt) return null;

  const type = TYPE_META[receipt.type];
  const chapter = CHAPTER_MAP[receipt.arc];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
        aria-describedby="receipt-modal-hint"
        style={{ '--chapter': chapter.color }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          ref={closeRef}
          aria-label={`Close details for ${receipt.title}`}
        >
          <span aria-hidden="true">✕</span>
        </button>

        <article className="modal-receipt" style={{ '--ink': type.ink }}>
          <div className="rc-head">
            <span className="rc-type">
              {type.icon} {type.label.toUpperCase()}
            </span>
            <span className="rc-id">#{receipt.id.slice(1)}</span>
          </div>
          <h2 className="rc-title rc-title-lg" id="receipt-modal-title">
            {receipt.title}
          </h2>
          <div className="rc-divider" />
          <ReceiptRows receipt={receipt} variant="full" />
          <div className="rc-divider" />
          <div className="rc-foot">
            <span>{formatLongDate(receipt.ts)}</span>
            <span>{formatTime(receipt.ts)}</span>
          </div>
          <p className="modal-chapterline" style={{ color: chapter.color }}>
            CHAPTER {chapter.num} — {chapter.title.toUpperCase()} · {chapter.moodLabel.toUpperCase()}
          </p>
          {receipt.tags?.length > 0 && (
            <ul className="modal-tags" aria-label="Theme tags">
              {receipt.tags.map((tag) => (
                <li key={tag} className="link-chip">
                  {tag.replace(/-/g, ' ')}
                </li>
              ))}
            </ul>
          )}
          <div className="barcode barcode-lg" aria-hidden="true" />
        </article>

        <section className="modal-links" aria-label="Related receipts">
          <h3>Found in the same threads</h3>
          <p className="modal-links-hint" id="receipt-modal-hint">
            These receipts share a day, a place, or a theme with this one. Select any of them to keep
            following the thread.
          </p>
          <div className="modal-links-grid">
            {links.length === 0 && <p className="rc-empty">A moment alone in the archive.</p>}
            {links.map(({ receipt: related, reasons }) => (
              <div className="link-item" key={related.id}>
                <ReceiptCard receipt={related} onOpen={onOpen} />
                <div className="link-reasons">
                  {reasons.slice(0, 3).map((reason) => (
                    <span key={reason} className="link-chip">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
