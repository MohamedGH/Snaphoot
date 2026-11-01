import React, { Component, createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppErrorLog, ErrorSeverity, ToastMessage } from './errorTypes';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ErrorContextType {
  readonly errors: readonly AppErrorLog[];
  readonly toasts: readonly ToastMessage[];
  readonly reportError: (code: string, message: string, severity?: ErrorSeverity, details?: string) => void;
  readonly dismissToast: (id: string) => void;
  readonly clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PulseMetrics Caught Render Exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Application Error</h2>
            </div>
            <p className="text-sm text-slate-300">
              An unexpected render issue occurred in the telemetry pipeline. You can safely reset the view.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-rose-300 overflow-x-auto border border-rose-950">
              {this.state.error?.message || 'Unknown render exception'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium rounded-xl transition cursor-pointer shadow-lg shadow-rose-900/30"
            >
              Reset to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErrorManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppErrorLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const reportError = useCallback(
    (code: string, message: string, severity: ErrorSeverity = 'error', details?: string) => {
      const id = `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const logItem: AppErrorLog = {
        id,
        timestamp: Date.now(),
        severity,
        code,
        message,
        details,
        dismissed: false,
      };

      setErrors(prev => [logItem, ...prev.slice(0, 49)]); // Keep last 50 error events

      // Trigger user-visible toast for warning/error/fatal
      const toastId = `toast-${id}`;
      setToasts(prev => [...prev.slice(-3), { id: toastId, severity, message }]);

      // Auto dismiss toast after 4.5 seconds
      setTimeout(() => {
        dismissToast(toastId);
      }, 4500);
    },
    [dismissToast]
  );

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        errors,
        toasts,
        reportError,
        dismissToast,
        clearAllErrors,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <aside aria-label="Notification Center" className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
        {toasts.map(toast => {
          const isErr = toast.severity === 'error' || toast.severity === 'fatal';
          const isWarn = toast.severity === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
                isErr
                  ? 'bg-rose-950/90 border-rose-700/60 text-rose-100 shadow-rose-950/40'
                  : isWarn
                  ? 'bg-amber-950/90 border-amber-700/60 text-amber-100 shadow-amber-950/40'
                  : 'bg-slate-900/90 border-slate-700/60 text-slate-100 shadow-black/40'
              }`}
            >
              {isErr ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isWarn ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs leading-relaxed font-medium">
                {toast.message}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 -mr-1 -mt-1 rounded-md transition cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ErrorContext.Provider>
  );
};

export const useErrorManager = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorManager must be used within ErrorManagerProvider');
  }
  return context;
};
