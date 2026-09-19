import { Component } from 'react';
import { trackError } from '@/services/telemetry.js';

/**
 * Top-level error boundary.
 *
 * A static archive has nothing to "retry", so the fallback offers the two
 * things that actually work: read the error, or reload. The boundary is a class
 * component because that is still the only way React exposes
 * `componentDidCatch`/`getDerivedStateFromError`.
 */
export default class ErrorBoundary extends Component {
  /** @type {{ hasError: boolean, error: Error|null }} */
  state = { hasError: false, error: null };

  /**
   * @param {Error} error
   * @returns {{ hasError: boolean, error: Error }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * @param {Error} error
   * @param {{ componentStack?: string }} info
   */
  componentDidCatch(error, info) {
    trackError(error, { componentStack: info?.componentStack, scope: 'ErrorBoundary' });
  }

  render() {
    const { hasError, error } = this.state;
    if (!hasError) return this.props.children;

    return (
      <div className="crash" role="alert">
        <h1>The archive failed to unroll</h1>
        <p>
          Something went wrong while rendering the receipts. The data itself is static, so a reload usually
          fixes it.
        </p>
        <pre className="crash-detail">{error?.message}</pre>
        <button type="button" className="cover-cta" onClick={() => window.location.reload()}>
          Reload the archive
        </button>
      </div>
    );
  }
}
