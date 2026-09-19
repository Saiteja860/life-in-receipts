/**
 * Single polite live region for the whole app.
 *
 * Views change visually in ways screen readers never hear, so the store pushes
 * short messages here ("Explorer. Search and filter every receipt.", "42 of 163
 * receipts") as the user navigates and filters.
 */
export default function Announcer({ message }) {
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="announcer">
      {message}
    </div>
  );
}
