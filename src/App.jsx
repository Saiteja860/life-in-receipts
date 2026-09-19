import { useMemo, useState, useCallback } from 'react'
import dataset from './data/dataset.json'
import { CHAPTER_MAP } from './data/chapters.js'
import Cover from './components/Cover.jsx'
import StoryView from './components/StoryView.jsx'
import Explorer from './components/Explorer.jsx'
import Insights from './components/Insights.jsx'
import ReceiptModal from './components/ReceiptModal.jsx'
import { buildLinkMap, findLinks } from './lib/links.js'
import { buildInsights } from './lib/insights.js'

export default function App() {
  const [view, setView] = useState('cover')
  const [lensOn, setLensOn] = useState(true)
  const [selected, setSelected] = useState(null)

  const linkMap = useMemo(() => buildLinkMap(dataset), [])
  const insights = useMemo(() => buildInsights(dataset, CHAPTER_MAP), [])

  const open = useCallback((r) => setSelected(r), [])
  const close = useCallback(() => setSelected(null), [])

  const navItems = [
    ['story', 'The Story'],
    ['explore', 'Explorer'],
    ['insights', 'Patterns'],
  ]

  if (view === 'cover') {
    return <Cover stats={insights} onEnter={() => setView('story')} />
  }

  return (
    <div className="app">
      <nav className="topnav">
        <button className="brand" onClick={() => setView('cover')}>🧾 Your Life, In Receipts</button>
        <div className="nav-links">
          {navItems.map(([id, label]) => (
            <button key={id} className={`nav-btn ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {view === 'story' && (
          <StoryView receipts={dataset} linkMap={linkMap} onOpen={open} lensOn={lensOn} setLensOn={setLensOn} />
        )}
        {view === 'explore' && <Explorer receipts={dataset} onOpen={open} />}
        {view === 'insights' && <Insights receipts={dataset} chapterMap={CHAPTER_MAP} />}
      </main>

      <ReceiptModal
        receipt={selected}
        links={selected ? findLinks(selected, dataset) : []}
        onClose={close}
        onOpen={open}
      />
    </div>
  )
}
