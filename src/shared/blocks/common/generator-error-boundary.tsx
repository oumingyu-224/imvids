'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface GeneratorErrorBoundaryProps {
  children: ReactNode;
}

interface GeneratorErrorBoundaryState {
  hasError: boolean;
}

/**
 * BUG-27：首页客户端组件的错误边界。
 * 白屏降级为局部错误提示，避免整页白屏。
 */
export class GeneratorErrorBoundary extends Component<
  GeneratorErrorBoundaryProps,
  GeneratorErrorBoundaryState
> {
  state: GeneratorErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GeneratorErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Landing client component crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] w-full items-center justify-center p-8">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold">
              Something went wrong on this page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
