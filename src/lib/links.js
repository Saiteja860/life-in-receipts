// The connection engine: derives relationships between receipts from the raw data.
// Three signals are used — shared day, shared place, shared theme tags.

function sameDay(a, b) {
  return a.ts.slice(0, 10) === b.ts.slice(0, 10)
}

function placeOf(r) {
  return r.meta.place || null
}

function sharedTags(a, b) {
  const set = new Set(b.tags)
  return a.tags.filter((t) => set.has(t))
}

const DAY_W = 3
const PLACE_W = 2.5
const TAG_W = 1.2
const ARC_W = 0.6

/**
 * For a receipt, returns related receipts sorted by a simple relevance score.
 * reason: 'same day' | 'same place' | 'theme: x'
 */
export function findLinks(receipt, all) {
  const links = []
  for (const other of all) {
    if (other.id === receipt.id) continue
    const reasons = []
    let score = 0
    if (sameDay(receipt, other)) {
      reasons.push('same day')
      score += DAY_W
    }
    const p1 = placeOf(receipt)
    const p2 = placeOf(other)
    if (p1 && p2 && (p1 === p2 || p1.includes(p2) || p2.includes(p1))) {
      reasons.push('same place')
      score += PLACE_W
    }
    const shared = sharedTags(receipt, other)
    if (shared.length) {
      reasons.push(...shared.slice(0, 2).map((t) => `theme: ${t.replace('-', ' ')}`))
      score += shared.length * TAG_W
    }
    if (receipt.arc === other.arc) score += ARC_W
    if (score >= 3) links.push({ receipt: other, score, reasons })
  }
  return links.sort((a, b) => b.score - a.score).slice(0, 8)
}

/** Precompute a link map id → links for O(1) lookups in the UI. */
export function buildLinkMap(all) {
  const map = {}
  for (const r of all) map[r.id] = findLinks(r, all)
  return map
}

/** Returns the set of receipt ids linked to the given one (including itself). */
export function linkedIdSet(linkMap, id) {
  const set = new Set([id])
  for (const l of linkMap[id] || []) set.add(l.receipt.id)
  return set
}
