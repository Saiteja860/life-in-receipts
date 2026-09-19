// Smoke test: verify dataset + logic libs work headlessly.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dataset = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'dataset.json'), 'utf8'))
const { CHAPTER_MAP, TYPE_META } = await import('../src/data/chapters.js')
const { buildLinkMap } = await import('../src/lib/links.js')
const { buildInsights } = await import('../src/lib/insights.js')

const types = new Set(dataset.map((r) => r.type))
console.log('receipts:', dataset.length)
console.log('types covered:', [...types].sort().join(', '), '| missing:', Object.keys(TYPE_META).filter((t) => !types.has(t)).join(',') || 'none')
console.log('arcs covered:', [...new Set(dataset.map((r) => r.arc))].join(','))
console.log('chronological:', dataset.every((r, i) => i === 0 || dataset[i - 1].ts <= r.ts))
console.log('all arcs mapped to chapters:', dataset.every((r) => CHAPTER_MAP[r.arc]))

const linkMap = buildLinkMap(dataset)
const withLinks = Object.values(linkMap).filter((l) => l.length > 0).length
console.log('receipts with links:', withLinks, '/', dataset.length)

const ins = buildInsights(dataset, CHAPTER_MAP)
console.log('total spend: ₹' + ins.totalSpend, '| busiest day:', ins.busiest.date, `(${ins.busiest.count} receipts)`)
console.log('late-night music plays:', ins.lateNightMusic, '/', ins.musicTotal)
console.log('top place:', ins.topPlaces[0])
