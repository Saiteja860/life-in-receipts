import { memo } from 'react';
import { LIMITS } from '@/constants';
import { linkedIdSet } from '@/lib/links.js';
import { pluralize } from '@/utils/format.js';
import ReceiptCard from './ReceiptCard.jsx';

/** Mood encoded as a block-glyph bar, index 0 === mood 1. */
const MOOD_BAR = ['▁', '▃', '▅', '▆', '█'];

/**
 * One chapter of The Story: heading, blurb, and its receipts on a thread.
 *
 * The first `LIMITS.CHAPTER_PREVIEW` receipts render immediately and the rest
 * are behind a disclosure button — a chapter of 25 cards would otherwise triple
 * the initial DOM for content most visitors reveal deliberately.
 *
 * @param {{
 *   chapter: import('@/types').Chapter & { items: import('@/types').Receipt[] },
 *   lensOn: boolean,
 *   hoveredId: string|null,
 *   linkMap: import('@/types').LinkMap,
 *   expanded: boolean,
 *   onToggleExpand: (id: string) => void,
 *   onOpen: (receipt: import('@/types').Receipt) => void,
 *   onHoverChange: (id: string|null) => void,
 * }} props
 */
function Chapter({ chapter, lensOn, hoveredId, linkMap, expanded, onToggleExpand, onOpen, onHoverChange }) {
  const total = chapter.items.length;
  const previewCount = Math.min(total, LIMITS.CHAPTER_PREVIEW);
  const visible = expanded ? chapter.items : chapter.items.slice(0, previewCount);
  const remaining = total - previewCount;

  // Only computed when the lens is actually showing something.
  const linkedIds = lensOn && hoveredId ? linkedIdSet(linkMap, hoveredId) : null;

  return (
    <section
      className="chapter"
      id={`chapter-${chapter.id}`}
      aria-labelledby={`chapter-${chapter.id}-title`}
      style={{ '--chapter': chapter.color }}
      onMouseLeave={() => lensOn && onHoverChange(null)}
    >
      <div className="chapter-head">
        <div className="chapter-num" aria-hidden="true">
          {chapter.num}
        </div>
        <div className="chapter-meta">
          <h3 id={`chapter-${chapter.id}-title`}>
            <span className="sr-only">Chapter {chapter.num}: </span>
            {chapter.title}
          </h3>
          <div className="chapter-sub">
            <span className="chapter-span">{chapter.span}</span>
            <span className="chapter-mood">
              MOOD: {chapter.moodLabel} {MOOD_BAR[chapter.mood - 1]}
            </span>
            <span className="chapter-count">{pluralize(total, 'receipt')}</span>
          </div>
        </div>
        <div className="chapter-thread" aria-hidden="true" />
      </div>

      <p className="chapter-blurb">{chapter.blurb}</p>

      <div className="chapter-grid" id={`chapter-${chapter.id}-grid`}>
        {visible.map((receipt) => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onOpen={onOpen}
            lensActive={lensOn && Boolean(hoveredId)}
            dimmed={Boolean(hoveredId) && !linkedIds?.has(receipt.id)}
            linked={Boolean(linkedIds?.has(receipt.id))}
            onHoverChange={onHoverChange}
          />
        ))}
      </div>

      {remaining > 0 && (
        <button
          type="button"
          className="chapter-more"
          onClick={() => onToggleExpand(chapter.id)}
          aria-expanded={expanded}
          aria-controls={`chapter-${chapter.id}-grid`}
        >
          {expanded ? '− fold chapter' : `+ ${pluralize(remaining, 'more receipt')} in this chapter`}
        </button>
      )}
    </section>
  );
}

export default memo(Chapter);
