/**
 * Suspense fallback for lazily-loaded views.
 *
 * It is a `role="status"` region so the (brief) wait is announced instead of
 * being an unexplained silence for screen-reader users.
 */
export default function ViewLoading({ label = 'view' }) {
  return (
    <div className="view-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading the {label}. One moment.</span>
      <div className="skeleton-line" aria-hidden="true" />
      <div className="skeleton-line" aria-hidden="true" />
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton-card" key={index} />
        ))}
      </div>
    </div>
  );
}
