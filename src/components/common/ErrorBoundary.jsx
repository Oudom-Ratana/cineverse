import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Ciniverse ErrorBoundary caught error]:', error, errorInfo);
    try {
      Sentry.captureException(error, { extra: errorInfo });
    } catch {
      // Sentry might not be initialized
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              Ciniverse encountered an unexpected interruption. We've logged this event to our monitoring systems.
            </p>

            {this.state.error && (
              <div className="bg-dark-950 p-3 rounded-lg text-left text-xs font-mono text-rose-400/90 mb-6 overflow-x-auto border border-rose-950">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-700 text-white font-medium transition shadow-lg shadow-rose-950"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
