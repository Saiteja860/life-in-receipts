import { useEffect, useMemo, useState } from 'react'

export default function Cover({ stats, onEnter }) {
  const lines = useMemo(
    () => [
      '2025 records found in the archive…',
      'music · movies · places · purchases · photos',
      'messages · searches · events · notes',
      'scanning for meaning…',
    ],
    []
  )
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= lines.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 520)
    return () => clearTimeout(t)
  }, [shown, lines.length])

  return (
    <div className="cover">
      <div className="cover-inner">
        <p className="cover-kicker">THE DIGITAL LIFE ARCHIVE · ONE YEAR · ONE PERSON</p>
        <h1 className="cover-title">
          Your Life,<br /><em>In Receipts</em>
        </h1>
        <p className="cover-sub">
          A year of someone's digital life, printed on {stats.total} little receipts.
          Individually, they mean almost nothing. Together, they mean everything.
        </p>
        <div className="cover-scan" role="status">
          {lines.slice(0, shown).map((l, i) => <p key={i} className="scanline">{l}</p>)}
          {shown < lines.length && <p className="scanline scan-cursor">▌</p>}
        </div>
        <button className="cover-cta" onClick={onEnter} disabled={shown < lines.length}>
          {shown < lines.length ? 'decoding…' : 'unwrap the archive →'}
        </button>
        <div className="cover-stats">
          <div><strong>{stats.total}</strong><span>receipts</span></div>
          <div><strong>{stats.totalEvents}</strong><span>events</span></div>
          <div><strong>₹{Math.round(stats.totalSpend / 1000)}k</strong><span>spent</span></div>
          <div><strong>8</strong><span>chapters</span></div>
        </div>
      </div>
      <div className="cover-shred" aria-hidden="true" />
    </div>
  )
}
