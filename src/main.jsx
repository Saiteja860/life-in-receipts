import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ArchiveProvider } from './context';
import { reportWebVitals } from './lib/perf.js';

// Stylesheet order matters: tokens + base components, then the refactor's new
// components, then responsive overrides, then print. Plain CSS only.
import './styles.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/print.css';

const container = document.getElementById('root');

createRoot(container).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ArchiveProvider>
        <App />
      </ArchiveProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Core Web Vitals are measured from the first paint; in dev they are printed,
// in production they are only sent when VITE_TELEMETRY=on (see lib/perf.js).
reportWebVitals();
