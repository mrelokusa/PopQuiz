import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import NeoButton from './ui/NeoButton';
import NeoCard from './ui/NeoCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neo-paper flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <NeoCard className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-neo-coral rounded-full border-2 border-black flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-black font-serif mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 font-medium">
                  The app encountered an unexpected error. Don't worry, your data is safe.
                </p>
              </div>

              <div className="space-y-3">
                <NeoButton
                  onClick={this.handleReset}
                  label="Try Again"
                  icon={RefreshCw}
                  className="w-full"
                  colorClass="bg-neo-mint text-white"
                />
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mt-6 p-4 bg-gray-100 border-2 border-black rounded-lg">
                  <summary className="font-bold cursor-pointer">Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </NeoCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;