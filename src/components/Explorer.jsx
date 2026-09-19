import { useMemo, useState } from 'react'
import { TYPE_META, CHAPTER_MAP } from '../data/chapters.js'
import ReceiptCard from './ReceiptCard.jsx'

const TYPES = Object.keys(TYPE_META)

export default function Explorer({ receipts, onOpen }) {
  const [q, setQ] = useState('')
  const [types, setTypes] = useState(new Set())
  const [month, setMonth] = useState(0) // 0 = all, 1..12 = Jan..Dec
  const [asc, setAsc] = useState(true)

  const months = ['All year', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = receipts.filter((r) => {
      if (types.size && !types.has(r.type)) return false
      if (month && Number(r.ts.slice(5, 7)) !== month) return false
      if (!needle) return true
      const hay = [
        r.title,
        r.meta.item, r.meta.artist, r.meta.place, r.meta.query,
        r.meta.contact, r.meta.where, r.meta.text, ...r.tags,
      ].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(needle)
    })
    list = [...list].sort((a, b) => (asc ? a.ts.localeCompare(b.ts) : b.ts.localeCompare(a.ts)))
    return list
  }, [receipts, q, types, month, asc])

  function toggleType(t) {
    setTypes((s) => {
      const n = new Set(s)
      n.has(t) ? n.delete(t) : n.add(t)
      return n
    })
  }

  return (
    <div className="explorer">
      <header className="view-head">
        <h2>Explorer — every receipt, searchable</h2>
        <p>Filter by type, scrub through the year, or dig for a single word. Every card opens its threads.</p>
      </header>

      <div className="explorer-bar">
        <input
          className="ex-search"
          type="search"
          placeholder="Search receipts… try “bench”, “Amma”, “goa”, “wonderwall”"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="ex-chips">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`chip ${types.has(t) ? 'on' : ''}`}
              style={{ '--ink': TYPE_META[t].ink }}
              onClick={() => toggleType(t)}
            >
              {TYPE_META[t].icon} {TYPE_META[t].label}
            </button>
          ))}
        </div>
        <div className="ex-controls">
          <label className="ex-slider">
            <span>Month</span>
            <input type="range" min="0" max="12" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
            <b>{months[month]}</b>
          </label>
          <button className="chip" onClick={() => setAsc((a) => !a)}>
            {asc ? '↑ oldest first' : '↓ newest first'}
          </button>
        </div>
        <div className="ex-count" aria-live="polite">{results.length} of {receipts.length} receipts</div>
      </div>

      <div className="ex-grid">
        {results.map((r) => <ReceiptCard key={r.id} receipt={r} onClick={onOpen} />)}
      </div>
      {results.length === 0 && (
        <div className="ex-empty">
          <p>No receipts match. The archive keeps its secrets.</p>
        </div>
      )}
      {results.length > 0 && (
        <div className="ex-strip">
          {results.slice(0, 40).map((r) => (
            <span
              key={r.id}
              className="strip-dot"
              title={`${r.title} · ${CHAPTER_MAP[r.arc]?.title || ''}`}
              style={{ background: CHAPTER_MAP[r.arc]?.color }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
