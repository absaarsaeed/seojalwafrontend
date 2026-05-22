import React from 'react';

/**
 * Generic Error Boundary that catches runtime errors in any child component
 * and shows a friendly "Try again" UI instead of crashing the whole route.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeUserRoute />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center max-w-lg mx-auto" data-testid="error-boundary">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-[#EF4444]">!</span>
          </div>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#6B7280] mb-4 break-words">
            {this.state.error?.message || 'An unexpected error occurred on this page.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg text-sm font-medium hover:bg-[#0F6E56] transition-colors"
              data-testid="error-boundary-retry"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-[#F0F0F0] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors"
              data-testid="error-boundary-reload"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
