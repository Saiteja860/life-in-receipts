// The insight engine: computes the "so what?" layer from the raw receipts.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function hourOf(r) {
  return Number(r.ts.slice(11, 13))
}
function monthOf(r) {
  return Number(r.ts.slice(5, 7)) - 1
}

export function buildInsights(receipts, chapterMap) {
  const byType = {}
  for (const r of receipts) byType[r.type] = (byType[r.type] || 0) + 1

  const spendByMonth = Array(12).fill(0)
  const countByMonth = Array(12).fill(0)
  let totalSpend = 0
  for (const r of receipts) {
    const m = monthOf(r)
    countByMonth[m]++
    const p = r.meta.price
    if (typeof p === 'number') {
      spendByMonth[m] += p
      totalSpend += p
    }
  }

  const hourBins = Array(24).fill(0)
  let lateNightMusic = 0
  let musicTotal = 0
  for (const r of receipts) {
    hourBins[hourOf(r)]++
    if (r.type === 'music') {
      musicTotal++
      if (hourOf(r) >= 0 && hourOf(r) < 4) lateNightMusic++
    }
  }

  const places = {}
  for (const r of receipts) {
    const p = r.meta.place
    if (p) places[p] = (places[p] || 0) + 1
  }
  const topPlaces = Object.entries(places)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const artists = {}
  for (const r of receipts) {
    if (r.type === 'music' && r.meta.artist && r.meta.artist !== 'self-curated') {
      artists[r.meta.artist] = (artists[r.meta.artist] || 0) + 1
    }
  }
  const topArtists = Object.entries(artists).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const contacts = {}
  for (const r of receipts) {
    if (r.type === 'message' && r.meta.contact) contacts[r.meta.contact] = (contacts[r.meta.contact] || 0) + 1
  }
  const topContacts = Object.entries(contacts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  // mood arc: average of note moods per month, falling back to chapter mood
  const moodByMonth = Array(12).fill(null)
  const moodAcc = Array.from({ length: 12 }, () => [])
  for (const r of receipts) {
    if (typeof r.meta.mood === 'number') moodAcc[monthOf(r)].push(r.meta.mood)
  }
  for (let m = 0; m < 12; m++) {
    if (moodAcc[m].length) {
      moodByMonth[m] = moodAcc[m].reduce((a, b) => a + b, 0) / moodAcc[m].length
    } else {
      // infer from chapters overlapping this month
      const arcs = new Set(receipts.filter((r) => monthOf(r) === m).map((r) => r.arc))
      const vals = [...arcs].map((a) => chapterMap[a]?.mood).filter(Boolean)
      if (vals.length) moodByMonth[m] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
  }

  // busiest single day ("a day fully lived")
  const byDay = {}
  for (const r of receipts) {
    const d = r.ts.slice(0, 10)
    byDay[d] = (byDay[d] || 0) + 1
  }
  let busiest = null
  for (const [d, c] of Object.entries(byDay)) {
    if (!busiest || c > busiest.count) busiest = { date: d, count: c }
  }

  // searches as a word-ish cloud of curiosity
  const searches = receipts.filter((r) => r.type === 'search').map((r) => r.title.replace(/"/g, ''))

  const totalPhotos = byType.photo || 0
  const totalEvents = byType.event || 0

  return {
    total: receipts.length,
    byType,
    spendByMonth,
    countByMonth,
    totalSpend,
    hourBins,
    lateNightMusic,
    musicTotal,
    topPlaces,
    topArtists,
    topContacts,
    moodByMonth,
    busiest,
    searches,
    totalPhotos,
    totalEvents,
    months: MONTHS,
  }
}
