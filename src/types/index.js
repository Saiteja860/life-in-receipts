// Shared JSDoc types. This module exports no runtime code: it exists so every
// other file can import these typedefs (`import('@/types').Receipt`) and so
// editors + `jsconfig.json` can check usages without a TypeScript build step.

/**
 * The nine receipt categories the archive must cover.
 * @typedef {'music'|'movie'|'place'|'purchase'|'photo'|'message'|'search'|'event'|'note'} ReceiptType
 */

/**
 * Free-form key/value block printed on a receipt
 * (e.g. `{ artist: 'Adele', note: 'repeated 11x' }`).
 * @typedef {Object.<string, string|number>} ReceiptMeta
 */

/**
 * One receipt — the atomic unit of the archive.
 * @typedef {Object} Receipt
 * @property {string} id Unique, stable id (`r001`).
 * @property {string} arc Chapter/arc id this receipt belongs to (`a1`…`a8`).
 * @property {ReceiptType} type Category used for filtering and ink colour.
 * @property {string} ts ISO-ish local timestamp `YYYY-MM-DDTHH:mm:ss`.
 * @property {string} title Human-readable headline.
 * @property {ReceiptMeta} meta Itemised metadata rows.
 * @property {string[]} tags Theme tags shared across receipts.
 */

/**
 * A derived connection between two receipts.
 * @typedef {Object} Link
 * @property {Receipt} receipt The related receipt.
 * @property {number} score Relevance score (higher is closer).
 * @property {string[]} reasons Human-readable reasons ('same day', 'theme: fitness').
 */

/** id → links index produced once per session. @typedef {Object.<string, Link[]>} LinkMap */

/** Narrative chapter metadata (authored in `src/data/chapters.js`). @typedef {Object} Chapter
 * @property {string} id
 * @property {string} num
 * @property {string} title
 * @property {string} span
 * @property {string} color
 * @property {number} mood 1–5
 * @property {string} moodLabel
 * @property {string} blurb
 * @property {Receipt[]} [items] Receipts injected by the story view.
 */

/** @typedef {Object.<string, Chapter>} ChapterMap */

/** Chart colours per receipt type. @typedef {Object} TypeMeta
 * @property {string} label
 * @property {string} icon
 * @property {string} ink
 */

/** Filter state owned by the archive store. @typedef {Object} Filters
 * @property {string} query
 * @property {string[]} types Selected receipt types (empty === all).
 * @property {number} month 0 === all, 1–12 === Jan–Dec.
 * @property {boolean} ascending Sort direction by timestamp.
 */

/**
 * Transient UI state owned by the reducer in `@/context/archiveReducer`.
 * Route state (view + filters) intentionally lives in the URL, not here.
 * @typedef {Object} ArchiveState
 * @property {boolean} lensOn Connection Lens toggle.
 * @property {string|null} selectedId Currently open receipt id.
 * @property {string|null} hoveredId Receipt under the lens cursor.
 * @property {string[]} expandedChapters Chapter ids expanded past the preview.
 */

/**
 * Aggregate metrics derived from the raw dataset.
 * @typedef {Object} Insights
 * @property {number} total
 * @property {Record<ReceiptType, number>} byType
 * @property {number[]} spendByMonth
 * @property {number[]} countByMonth
 * @property {number} totalSpend
 * @property {number[]} hourBins
 * @property {number} lateNightMusic
 * @property {number} musicTotal
 * @property {[string, number][]} topPlaces
 * @property {[string, number][]} topArtists
 * @property {[string, number][]} topContacts
 * @property {(number|null)[]} moodByMonth
 * @property {{ date: string, count: number }|null} busiest
 * @property {string[]} searches
 * @property {number} totalPhotos
 * @property {number} totalEvents
 * @property {string[]} months
 */

/**
 * Result of validating the bundled dataset against the receipt schema.
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Receipt[]} receipts
 * @property {string[]} errors
 * @property {string[]} warnings
 */

/** A metric captured by the web-vitals reporter. @typedef {Object} PerfMetric
 * @property {string} name
 * @property {number} value
 * @property {string} rating
 */

/**
 * Everything the UI needs, produced once by `@/services/archiveService`.
 * @typedef {Object} ArchiveBundle
 * @property {Receipt[]} receipts
 * @property {Chapter[]} chapters
 * @property {ChapterMap} chapterMap
 * @property {Record<ReceiptType, TypeMeta>} typeMeta
 * @property {LinkMap} linkMap
 * @property {Insights} insights
 * @property {{ total: number, connected: number, coverage: number, averageLinks: number, maxLinks: number, reasons: [string, number][] }} connection
 * @property {{ errors: string[], warnings: string[] }} issues
 * @property {boolean} valid
 */

/**
 * The object returned by `useArchive()`: data + route + interaction state.
 * Kept as one typedef so consumers get editor completion for the whole store.
 * @typedef {ArchiveBundle & {
 *   view: string,
 *   filters: Filters,
 *   goToView: (view: string) => void,
 *   enterArchive: () => void,
 *   setQuery: (query: string) => void,
 *   setMonth: (month: number) => void,
 *   toggleSort: () => void,
 *   toggleTypeFilter: (type: string) => void,
 *   clearFilters: () => void,
 *   navigate: Function,
 *   lensOn: boolean,
 *   toggleLens: () => void,
 *   selectedReceipt: Receipt|null,
 *   selectedLinks: Link[],
 *   openReceipt: (receipt: Receipt) => void,
 *   closeReceipt: () => void,
 *   hoveredId: string|null,
 *   hoverReceipt: (id: string|null) => void,
 *   expandedChapters: string[],
 *   toggleChapter: (id: string) => void,
 *   visibleReceipts: Receipt[],
 *   chaptersWithItems: Chapter[],
 *   announcement: string,
 *   announce: (message: string) => void
 * }} ArchiveStore
 */

export {};
