import { useMemo, useState } from 'react'
import { CHAPTERS, TYPE_META } from '../data/chapters.js'
import ReceiptCard from './ReceiptCard.jsx'
import { linkedIdSet } from '../lib/links.js'

const MOOD_BAR = ['▁', '▃', '▅', '▆', '█']

export default function StoryView({ receipts, linkMap, onOpen, lensOn, setLensOn }) {
  const [hoverId, setHoverId] = useState(null)
  const [expanded, setExpanded] = useState({})

  const linked = useMemo(() => (hoverId ? linkedIdSet(linkMap, hoverId) : null), [hoverId, linkMap])

  const chapters = useMemo(
    () => CHAPTERS.map((c) => ({ ...c, items: receipts.filter((r) => r.arc === c.id) })),
    [receipts]
  )

  return (
    <div className="story">
      <header className="view-head">
        <h2>The Story in Eight Chapters</h2>
        <p>
          One dataset, one year, eight turns of a life. Hover any receipt with the{' '}
          <button className={`lens-toggle ${lensOn ? 'on' : ''}`} onClick={() => setLensOn(!lensOn)} aria-pressed={lensOn}>
            ◉ Connection Lens {lensOn ? 'ON' : 'OFF'}
          </button>{' '}
          to see which other receipts belong to the same threads.
        </p>
        <nav className="chapter-nav" aria-label="Jump to chapter">
          {CHAPTERS.map((c) => (
            <a key={c.id} href={`#chapter-${c.id}`} style={{ '--chapter': c.color }} title={`${c.num} · ${c.title}`}>
              {c.num} {c.title}
            </a>
          ))}
        </nav>
      </header>

      {chapters.map((c) => {
        const isOpen = expanded[c.id] || false
        const shown = isOpen ? c.items : c.items.slice(0, 7)
        return (
          <section
            className="chapter"
            key={c.id}
            id={`chapter-${c.id}`}
            aria-label={`Chapter ${c.num}: ${c.title}`}
            style={{ '--chapter': c.color }}
            onMouseLeave={() => lensOn && setHoverId(null)}
          >
            <div className="chapter-head">
              <div className="chapter-num">{c.num}</div>
              <div className="chapter-meta">
                <h3>{c.title}</h3>
                <div className="chapter-sub">
                  <span className="chapter-span">{c.span}</span>
                  <span className="chapter-mood">MOOD: {c.moodLabel} {MOOD_BAR[c.mood - 1]}</span>
                  <span className="chapter-count">{c.items.length} receipts</span>
                </div>
              </div>
              <div className="chapter-thread" aria-hidden="true" />
            </div>
            <p className="chapter-blurb">{c.blurb}</p>
            <div className="chapter-grid">
              {shown.map((r) => (
                <ReceiptCard
                  key={r.id}
                  receipt={r}
                  onClick={onOpen}
                  focusMode={lensOn && !!hoverId}
                  dimmed={hoverId && !linked.has(r.id)}
                  linked={linked?.has(r.id)}
                  onMouseEnter={lensOn ? () => setHoverId(r.id) : undefined}
                />
              ))}
            </div>
            {c.items.length > 7 && (
              <button className="chapter-more" onClick={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}>
                {isOpen ? '− fold chapter' : `+ ${c.items.length - 7} more receipts in this chapter`}
              </button>
            )}
          </section>
        )
      })}

      <footer className="story-finale">
        <h3>One year. {receipts.length} receipts. One person who kept going.</h3>
        <p>
          Look again at the pattern: heartbreak → habits → ambition → escape → roots → love → craft → home.
          No single receipt says it. All of them do.
        </p>
      </footer>
    </div>
  )
}
