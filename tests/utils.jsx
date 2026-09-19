// Test helpers shared by the component/integration suites.
import { render } from '@testing-library/react';
import App from '@/App.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import { ArchiveProvider } from '@/context';

/**
 * Renders the real application tree (boundary → store → App).
 * @param {{ hash?: string }} [options] Route to start on, e.g. `#/explore?q=goa`.
 * @returns {import('@testing-library/react').RenderResult}
 */
export function renderApp({ hash = '' } = {}) {
  if (hash) window.history.replaceState(null, '', hash);
  return render(
    <ErrorBoundary>
      <ArchiveProvider>
        <App />
      </ArchiveProvider>
    </ErrorBoundary>
  );
}
