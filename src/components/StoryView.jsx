import { CHAPTERS } from '@/data/chapters.js';
import { useArchive } from '@/context';
import { useHasHover } from '@/hooks';
import { pluralize } from '@/utils/format.js';
import Chapter from './Chapter.jsx';

/**
 * The Story — eight chapters, read in order.
 *
 * This view is the narration layer: it owns no data of its own, it renders the
 * chapters produced by the store and delegates card behaviour to `<Chapter>`.
 */
export default function StoryView() {
  const {
    receipts,
    chaptersWithItems,
    linkMap,
    lensOn,
    toggleLens,
    hoveredId,
    hoverReceipt,
    expandedChapters,
    toggleChapter,
    openReceipt,
  } = useArchive();
  const hasHover = useHasHover();

  const finale = (
    <footer className="story-finale">
      <h2>One year. {pluralize(receipts.length, 'receipt')}. One person who kept going.</h2>
      <p>
        Look again at the pattern: heartbreak → habits → ambition → escape → roots → love → craft → home. No
        single receipt says it. All of them do.
      </p>
    </footer>
  );

  return (
    <div className="story">
      <header className="view-head">
        <h1 className="view-title">The Story in Eight Chapters</h1>
        <p>
          One dataset, one year, eight turns of a life. Turn on the{' '}
          <button
            type="button"
            className={lensOn ? 'lens-toggle on' : 'lens-toggle'}
            onClick={toggleLens}
            aria-pressed={lensOn}
          >
            ◉ Connection Lens {lensOn ? 'ON' : 'OFF'}
          </button>{' '}
          and {hasHover ? 'hover' : 'focus'} any receipt to see which others belong to the same threads (same
          day, same place, same themes).
        </p>

        <nav className="chapter-nav" aria-label="Jump to a chapter">
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.id}
              href={`#chapter-${chapter.id}`}
              style={{ '--chapter': chapter.color }}
              title={`${chapter.num} · ${chapter.title}`}
            >
              <span aria-hidden="true">{chapter.num}</span> {chapter.title}
            </a>
          ))}
        </nav>
      </header>

      {chaptersWithItems.map((chapter) => (
        <Chapter
          key={chapter.id}
          chapter={chapter}
          lensOn={lensOn}
          hoveredId={hoveredId}
          linkMap={linkMap}
          expanded={expandedChapters.includes(chapter.id)}
          onToggleExpand={toggleChapter}
          onOpen={openReceipt}
          onHoverChange={hoverReceipt}
        />
      ))}

      {finale}
    </div>
  );
}
