import { TYPE_META, CHAPTER_MAP } from '../data/chapters.js'

const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

// deterministic tilt from id so cards don't jitter on re-render
function tilt(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return ((h % 7) - 3) * 0.35
}

function Barcode() {
  return <div className="barcode" aria-hidden="true" />
}

export default function ReceiptCard({ receipt, onClick, dimmed, linked, focusMode, onMouseEnter }) {
  const t = TYPE_META[receipt.type]
  const date = new Date(receipt.ts)
  const chapter = CHAPTER_MAP[receipt.arc]
  const cls = ['receipt-card']
  if (focusMode && dimmed) cls.push('is-dimmed')
  if (focusMode && linked) cls.push('is-linked')

  return (
    <button
      className={cls.join(' ')}
      style={{ '--tilt': `${tilt(receipt.id)}deg`, '--ink': t.ink, '--chapter': chapter.color }}
      onClick={() => onClick(receipt)}
      onMouseEnter={onMouseEnter}
    >
      <div className="rc-head">
        <span className="rc-type">{t.icon} {t.label.toUpperCase()}</span>
        <span className="rc-id">#{receipt.id.slice(1)}</span>
      </div>
      <div className="rc-title">{receipt.title}</div>
      <div className="rc-divider" />
      <div className="rc-rows">
        {receipt.meta.item && <div className="rc-row"><span>ITEM</span><span className="rc-val">{receipt.meta.item}</span></div>}
        {receipt.meta.artist && <div className="rc-row"><span>ARTIST</span><span className="rc-val">{receipt.meta.artist}</span></div>}
        {receipt.meta.place && <div className="rc-row"><span>PLACE</span><span className="rc-val">{receipt.meta.place}</span></div>}
        {receipt.meta.query && <div className="rc-row"><span>ENGINE</span><span className="rc-val">{receipt.meta.query}</span></div>}
        {receipt.meta.contact && <div className="rc-row"><span>WITH</span><span className="rc-val">{receipt.meta.contact}</span></div>}
        {receipt.meta.dwell && <div className="rc-row"><span>DWELL</span><span className="rc-val">{receipt.meta.dwell}</span></div>}
        {receipt.meta.rating && <div className="rc-row"><span>RATED</span><span className="rc-val">{receipt.meta.rating}</span></div>}
        {typeof receipt.meta.price === 'number' && (
          <div className="rc-row rc-price"><span>TOTAL</span><span className="rc-val">₹{receipt.meta.price.toLocaleString('en-IN')}</span></div>
        )}
      </div>
      <div className="rc-divider" />
      <div className="rc-foot">
        <span>{fmt.format(date)}</span>
        <span>{receipt.ts.slice(11, 16)}</span>
      </div>
      <Barcode />
    </button>
  )
}
