import { useEffect, useRef } from 'react'
import { TYPE_META, CHAPTER_MAP } from '../data/chapters.js'
import ReceiptCard from './ReceiptCard.jsx'

const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

export default function ReceiptModal({ receipt, links, onClose, onOpen }) {
  const closeRef = useRef(null)

  // Accessibility: Escape closes, focus moves to dialog, background scroll locks.
  useEffect(() => {
    if (!receipt) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [receipt, onClose])

  if (!receipt) return null
  const t = TYPE_META[receipt.type]
  const chapter = CHAPTER_MAP[receipt.arc]
  const date = new Date(receipt.ts)

  const metaRows = Object.entries(receipt.meta).map(([k, v]) => (
    <div className="rc-row" key={k}><span>{k.toUpperCase()}</span><span className="rc-val">{String(v)}</span></div>
  ))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Receipt: ${receipt.title}`}
        style={{ '--chapter': chapter.color }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close receipt details" ref={closeRef}>✕</button>
        <div className="modal-receipt" style={{ '--ink': t.ink }}>
          <div className="rc-head">
            <span className="rc-type">{t.icon} {t.label.toUpperCase()}</span>
            <span className="rc-id">#{receipt.id.slice(1)}</span>
          </div>
          <div className="rc-title rc-title-lg">{receipt.title}</div>
          <div className="rc-divider" />
          <div className="rc-rows">{metaRows}</div>
          <div className="rc-divider" />
          <div className="rc-foot">
            <span>{fmt.format(date)}</span>
            <span>{receipt.ts.slice(11, 16)}</span>
          </div>
          <div className="modal-chapterline" style={{ color: chapter.color }}>
            CHAPTER {chapter.num} — {chapter.title.toUpperCase()} · {chapter.moodLabel.toUpperCase()}
          </div>
          <div className="barcode barcode-lg" aria-hidden="true" />
        </div>

        <div className="modal-links">
          <h3>Found in the same threads</h3>
          <p className="modal-links-hint">These receipts share a day, a place, or a theme with this one.</p>
          <div className="modal-links-grid">
            {links.length === 0 && <p className="rc-empty">A moment alone in the archive.</p>}
            {links.map(({ receipt: r, reasons }) => (
              <div className="link-item" key={r.id}>
                <ReceiptCard receipt={r} onClick={() => onOpen(r)} />
                <div className="link-reasons">
                  {reasons.slice(0, 2).map((x) => <span key={x} className="link-chip">{x}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
