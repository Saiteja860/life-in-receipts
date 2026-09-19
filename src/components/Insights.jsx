import { useMemo } from 'react'
import { buildInsights } from '../lib/insights.js'

function BarRow({ label, value, max, color, suffix }) {
  return (
    <div className="chart-row">
      <span className="chart-label">{label}</span>
      <div className="chart-track">
        <div className="chart-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="chart-val">{suffix}</span>
    </div>
  )
}

export default function Insights({ receipts, chapterMap }) {
  const s = useMemo(() => buildInsights(receipts, chapterMap), [receipts, chapterMap])
  const maxSpend = Math.max(...s.spendByMonth, 1)
  const maxCount = Math.max(...s.countByMonth, 1)
  const maxHour = Math.max(...s.hourBins, 1)
  const lateNightPct = s.musicTotal ? Math.round((s.lateNightMusic / s.musicTotal) * 100) : 0
  const moodPts = s.moodByMonth
    .map((v, i) => (v == null ? null : `${(i / 11) * 300 + 10},${60 - ((v - 1) / 4) * 46}`))
    .filter(Boolean)
    .join(' ')

  return (
    <div className="insights">
      <header className="view-head">
        <h2>Patterns — what the receipts confess</h2>
        <p>Computed live from the raw records. This is where the data stops being data.</p>
      </header>

      <div className="ins-grid">
        <div className="ins-card">
          <h3>The 2 AM Index</h3>
          <p className="ins-big">{lateNightPct}%</p>
          <p className="ins-note">
            of all {s.musicTotal} logged plays happened between midnight and 4 AM.
            The archive suspects at least one heavy season ({s.lateNightMusic} late-night plays).
          </p>
        </div>
        <div className="ins-card">
          <h3>The Ledger</h3>
          <p className="ins-big">₹{s.totalSpend.toLocaleString('en-IN')}</p>
          <p className="ins-note">
            traced across purchases — from an ice cream tub that cost ₹285 to a guitar that cost ₹6,499 and fixed a whole season.
          </p>
        </div>
        <div className="ins-card">
          <h3>The Regulars</h3>
          {s.topPlaces.map(([p, c]) => (
            <BarRow key={p} label={p} value={c} max={s.topPlaces[0][1]} color="#2f7d5a" suffix={`${c}×`} />
          ))}
        </div>
        <div className="ins-card">
          <h3>The Soundtrack</h3>
          {s.topArtists.map(([a, c]) => (
            <BarRow key={a} label={a} value={c} max={Math.max(...s.topArtists.map((x) => x[1]))} color="#4a3b8f" suffix={`${c}×`} />
          ))}
          {s.topContacts.length > 0 && (
            <p className="ins-note">Most messaged: {s.topContacts.map(([c, n]) => `${c} (${n})`).join(' · ')}</p>
          )}
        </div>
      </div>

      <div className="ins-row2">
        <div className="ins-card ins-wide">
          <h3>Spending by month</h3>
          <div className="chart-bars">
            {s.spendByMonth.map((v, i) => (
              <div className="bar-col" key={i} title={`${s.months[i]}: ₹${v.toLocaleString('en-IN')}`}>
                <div className="bar" style={{ height: `${Math.max((v / maxSpend) * 100, 2)}%` }} />
                <span>{s.months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ins-card ins-wide">
          <h3>Mood arc of the year</h3>
          <svg viewBox="0 0 320 70" className="mood-svg" preserveAspectRatio="none">
            <polyline points={moodPts} fill="none" stroke="#c9754b" strokeWidth="2.5" strokeLinejoin="round" />
            {moodPts.split(' ').map((pt, i) => {
              const [x, y] = pt.split(',')
              return <circle key={i} cx={x} cy={y} r="2.6" fill="#c9754b" />
            })}
          </svg>
          <div className="mood-labels">{s.months.map((m) => <span key={m}>{m}</span>)}</div>
        </div>
      </div>

      <div className="ins-row2">
        <div className="ins-card ins-wide">
          <h3>When the year happened (hour of day)</h3>
          <div className="heat-strip">
            {s.hourBins.map((v, i) => (
              <div
                key={i}
                className="heat-cell"
                title={`${String(i).padStart(2, '0')}:00 — ${v} receipts`}
                style={{ opacity: 0.15 + (v / maxHour) * 0.85 }}
              />
            ))}
          </div>
          <div className="mood-labels"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
        </div>
        <div className="ins-card">
          <h3>Curiosity log</h3>
          <p className="ins-note">Actual searches, in order of the year:</p>
          <ul className="search-list">
            {s.searches.slice(0, 9).map((q, i) => <li key={i}>{q}</li>)}
          </ul>
          <p className="ins-note">…{s.searches.length - 9} more in the Explorer.</p>
        </div>
      </div>

      {s.busiest && (
        <div className="ins-busiest">
          <strong>Busiest day: {s.busiest.date}</strong> — {s.busiest.count} receipts in a single day.
          A day fully lived. Find it in the Explorer.
        </div>
      )}
    </div>
  )
}
