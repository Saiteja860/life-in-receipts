import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { LIMITS, MONTH_FILTER_LABELS, RECEIPT_TYPES } from '@/constants';
import { CHAPTER_MAP } from '@/data/chapters.js';
import { useArchive } from '@/context';
import { useDebouncedValue, useIncrementalReveal } from '@/hooks';
import { countActiveFilters } from '@/lib/filters.js';
import { pluralize } from '@/utils/format.js';
import ReceiptCard from './ReceiptCard.jsx';

/**
 * Explorer — every receipt, searchable.
 *
 * Filter state lives in the URL (via the store), so any filtered view is a
 * shareable link (`#/explore?q=goa&type=photo&month=6`) and the browser back
 * button behaves. The input keeps a local draft so typing stays instant while
 * the URL is updated debounced.
 */
export default function Explorer() {
  const {
    receipts,
    visibleReceipts,
    filters,
    insights,
    typeMeta,
    setQuery,
    setMonth,
    toggleSort,
    toggleTypeFilter,
    clearFilters,
    openReceipt,
    announce,
  } = useArchive();

  const searchId = useId();
  const monthId = useId();
  const [draft, setDraft] = useState(filters.query);
  const debouncedQuery = useDebouncedValue(draft, 250);
  const searchIndexHint = useId();
  // Last value this component actually pushed into the URL. Without it, a
  // debounce tick could re-apply a stale query *after* the visitor cleared the
  // filters (or pressed Back), because the timer is still in flight.
  const pushedQuery = useRef(filters.query);

  // Draft → URL (debounced, and only when it genuinely differs from the URL).
  useEffect(() => {
    if (debouncedQuery === pushedQuery.current) return;
    pushedQuery.current = debouncedQuery;
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);

  // URL → draft (back/forward, shared link, cleared filters).
  useEffect(() => {
    pushedQuery.current = filters.query;
    setDraft((current) => (current === filters.query ? current : filters.query));
  }, [filters.query]);

  const { visibleCount, sentinelRef, hasMore, revealMore } = useIncrementalReveal(visibleReceipts.length);
  const shown = visibleReceipts.slice(0, visibleCount);
  const activeFilters = countActiveFilters(filters);

  useEffect(() => {
    announce(`${pluralize(visibleReceipts.length, 'receipt')} match the current filters.`);
  }, [visibleReceipts.length, announce]);

  const strip = useMemo(
    () =>
      visibleReceipts.slice(0, LIMITS.STRIP_DOTS).map((receipt) => ({
        id: receipt.id,
        color: CHAPTER_MAP[receipt.arc]?.color,
        label: `${receipt.title} · ${CHAPTER_MAP[receipt.arc]?.title ?? ''}`,
      })),
    [visibleReceipts]
  );

  const shareView = useCallback(async () => {
    const url = typeof window === 'undefined' ? '' : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      announce('Link to this filtered view copied to the clipboard.');
    } catch {
      announce('Copying failed. You can copy the address bar instead.');
    }
  }, [announce]);

  return (
    <div className="explorer">
      <header className="view-head">
        <h1 className="view-title">Explorer — every receipt, searchable</h1>
        <p>
          Filter by category, scrub through the year, or dig for a single word. Every card opens its threads.
          The current filters live in the address bar, so you can share or bookmark this exact view.
        </p>
      </header>

      <form className="explorer-bar" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="field" htmlFor={searchId}>
          Search receipts
        </label>
        <input
          id={searchId}
          className="ex-search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="try “bench”, “Amma”, “goa”, “wonderwall”"
          aria-describedby={searchIndexHint}
          autoComplete="off"
        />
        <p id={searchIndexHint} className="field-hint">
          Searches titles, item names, artists, places, people, search terms and themes. All words must match.
        </p>

        <fieldset className="ex-chips">
          <legend className="sr-only">Filter by receipt category</legend>
          {RECEIPT_TYPES.map((type) => {
            const meta = typeMeta[type];
            const on = filters.types.includes(type);
            const count = insights.byType?.[type] ?? 0;
            return (
              <button
                key={type}
                type="button"
                className={on ? 'chip on' : 'chip'}
                style={{ '--ink': meta?.ink }}
                onClick={() => toggleTypeFilter(type)}
                aria-pressed={on}
              >
                <span aria-hidden="true">{meta?.icon}</span> {meta?.label ?? type}
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </fieldset>

        <div className="ex-controls">
          <label className="ex-slider" htmlFor={monthId}>
            <span>Month</span>
            <input
              id={monthId}
              type="range"
              min="0"
              max="12"
              value={filters.month}
              onChange={(event) => setMonth(Number(event.target.value))}
              aria-valuetext={MONTH_FILTER_LABELS[filters.month]}
            />
            <b>{MONTH_FILTER_LABELS[filters.month]}</b>
          </label>

          <button
            type="button"
            className="chip"
            onClick={toggleSort}
            aria-label={`Sort ${filters.ascending ? 'newest first' : 'oldest first'}`}
          >
            <span aria-hidden="true">{filters.ascending ? '↑' : '↓'}</span>{' '}
            {filters.ascending ? 'oldest first' : 'newest first'}
          </button>

          {activeFilters > 0 && (
            <>
              <button type="button" className="chip chip-reset" onClick={clearFilters}>
                ✕ clear {pluralize(activeFilters, 'filter')}
              </button>
              <button type="button" className="chip" onClick={shareView}>
                ⧉ copy view link
              </button>
            </>
          )}
        </div>

        <p className="ex-count" aria-live="polite" data-testid="result-count">
          {visibleReceipts.length} of {receipts.length} receipts
        </p>
      </form>

      {shown.length > 0 && (
        <div className="ex-grid">
          {shown.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onOpen={openReceipt}
              lensActive={false}
              onHoverChange={undefined}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="ex-more">
          <div ref={sentinelRef} className="ex-sentinel" aria-hidden="true" />
          <button type="button" className="chapter-more" onClick={revealMore}>
            + show {Math.min(LIMITS.REVEAL_BATCH, visibleReceipts.length - visibleCount)} more
          </button>
        </div>
      )}

      {visibleReceipts.length === 0 && (
        <p className="ex-empty" role="status">
          No receipts match. The archive keeps its secrets — try clearing a filter.
        </p>
      )}

      {strip.length > 0 && (
        <div className="ex-strip" aria-hidden="true">
          {strip.map((dot) => (
            <span key={dot.id} className="strip-dot" title={dot.label} style={{ background: dot.color }} />
          ))}
        </div>
      )}
    </div>
  );
}
