// Error Handling and Loading States

import React from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export class ErrorHandler {
  static handle(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    );
  }

  static isAuthError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('token')
    );
  }

  static isValidationError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('400') ||
      error.message.includes('validation') ||
      error.message.includes('invalid')
    );
  }
}

export class LoadingStateManager {
  static createInitialState<T>(): AsyncState<T> {
    return {
      isLoading: false,
      error: null,
      data: null,
    };
  }

  static setLoading<T>(state: AsyncState<T>): AsyncState<T> {
    return {
      ...state,
      isLoading: true,
      error: null,
    };
  }

  static setSuccess<T>(state: AsyncState<T>, data: T): AsyncState<T> {
    return {
      ...state,
      isLoading: false,
      error: null,
      data,
    };
  }

  static setError<T>(state: AsyncState<T>, error: string): AsyncState<T> {
    return {
      ...state,
      isLoading: false,
      error,
    };
  }

  static reset<T>(state: AsyncState<T>): AsyncState<T> {
    return {
      ...state,
      isLoading: false,
      error: null,
    };
  }
}

// Custom hook for managing async state
export function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = React.useState<AsyncState<T>>({
    isLoading: false,
    error: null,
    data: initialData,
  });

  const setLoading = React.useCallback(() => {
    setState(prev => LoadingStateManager.setLoading(prev));
  }, []);

  const setSuccess = React.useCallback((data: T) => {
    setState(prev => LoadingStateManager.setSuccess(prev, data));
  }, []);

  const setError = React.useCallback((error: string) => {
    setState(prev => LoadingStateManager.setError(prev, error));
  }, []);

  const reset = React.useCallback(() => {
    setState(prev => LoadingStateManager.reset(prev));
  }, []);

  return {
    ...state,
    setLoading,
    setSuccess,
    setError,
    reset,
  };
}

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-4">
        {ErrorHandler.handle(error)}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-vt-maroon text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

