import { formatCurrency } from '@/utils/format.js';

/** Field order + printed label for the compact card receipt. */
const CARD_FIELDS = [
  ['item', 'ITEM'],
  ['artist', 'ARTIST'],
  ['place', 'PLACE'],
  ['query', 'ENGINE'],
  ['contact', 'WITH'],
  ['dwell', 'DWELL'],
  ['rating', 'RATED'],
];

/** Labels for keys that only appear in the expanded modal receipt. */
const EXTRA_LABELS = {
  price: 'TOTAL',
  where: 'WHERE',
  text: 'TEXT',
  note: 'NOTE',
  mood: 'MOOD',
  camera: 'CAMERA',
  engine: 'ENGINE',
};

/**
 * Renders the itemised meta block of a receipt.
 *
 * Extraction rationale: the card and the modal print the *same* data at two
 * levels of detail, so the formatting rules (currency, labels, ordering) live
 * in one component instead of drifting apart in two.
 *
 * @param {{ receipt: import('@/types').Receipt, variant?: 'card'|'full' }} props
 */
export default function ReceiptRows({ receipt, variant = 'card' }) {
  const meta = receipt.meta ?? {};

  if (variant === 'full') {
    return (
      <div className="rc-rows">
        {Object.entries(meta).map(([key, value]) => (
          <Row
            key={key}
            label={EXTRA_LABELS[key] ?? key.toUpperCase()}
            value={value}
            emphasise={key === 'price'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rc-rows">
      {CARD_FIELDS.map(([key, label]) =>
        meta[key] == null ? null : <Row key={key} label={label} value={meta[key]} />
      )}
      {typeof meta.price === 'number' && <Row label="TOTAL" value={meta.price} emphasise />}
    </div>
  );
}

/**
 * One `LABEL …… value` line.
 * @param {{ label: string, value: string|number, emphasise?: boolean }} props
 */
function Row({ label, value, emphasise = false }) {
  const printed = typeof value === 'number' ? formatCurrency(value) : String(value);
  return (
    <div className={emphasise ? 'rc-row rc-price' : 'rc-row'}>
      <span>{label}</span>
      <span className="rc-val">{printed}</span>
    </div>
  );
}
