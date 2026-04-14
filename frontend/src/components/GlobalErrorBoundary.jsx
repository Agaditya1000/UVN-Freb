import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={48} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-text uppercase tracking-tight">System Encountered a Glitch</h1>
              <p className="text-text-secondary font-medium leading-relaxed">
                We've encountered an unexpected error. Don't worry, your financial data is safe.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
              >
                <RefreshCw size={18} />
                Refresh Dashboard
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-surface border border-border text-text-secondary rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                <Home size={18} />
                Return to Home
              </button>
            </div>

            <div className="pt-8 border-t border-border mt-10">
               <p className="text-[10px] text-text-secondary font-mono opacity-50 truncate">
                  Error Code: {this.state.error?.message || 'UNKNOWN_RUNTIME_EXCEPTION'}
               </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
