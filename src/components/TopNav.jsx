import { useEffect, useId, useState } from 'react';
import { APP, NAV_ITEMS } from '@/constants';
import { useEscapeKey, useIsCompactViewport } from '@/hooks';

/**
 * Primary navigation.
 *
 * The items are real `<a href="#/view">` links rather than buttons so they can
 * be opened in a new tab, copied, or read as links by assistive tech — the hash
 * router listens for the same `hashchange` that the click triggers.
 *
 * On compact viewports the links collapse behind a disclosure button whose
 * `aria-expanded`/`aria-controls` wiring keeps the state audible.
 *
 * @param {{ view: string, onHome: () => void }} props
 */
export default function TopNav({ view, onHome }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompact = useIsCompactViewport();
  const menuId = useId();

  useEscapeKey(() => setMenuOpen(false), menuOpen);
  // Any navigation closes the drawer (including back/forward).
  useEffect(() => setMenuOpen(false), [view]);

  const expanded = !isCompact || menuOpen;

  return (
    <nav className="topnav" aria-label="Primary">
      <button type="button" className="brand" onClick={onHome}>
        <span aria-hidden="true">🧾</span> {APP.name}
      </button>

      <div className="nav-right">
        {isCompact && (
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            <span className="sr-only">{menuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
          </button>
        )}

        <ul className="nav-links" id={menuId} data-open={expanded ? 'true' : 'false'}>
          {NAV_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <a
                className={view === id ? 'nav-btn active' : 'nav-btn'}
                href={`#/${id}`}
                aria-current={view === id ? 'page' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
