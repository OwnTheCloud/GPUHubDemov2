import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isPowerPlatform: this.isPowerPlatform(),
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // Auto-retry for Power Platform environments with certain error types
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private isPowerPlatform(): boolean {
    return typeof window !== 'undefined' &&
      (window.location.hostname.includes('powerapps.com') ||
       window.location.hostname.includes('powerplatformusercontent.com'));
  }

  private shouldAutoRetry(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const powerPlatformErrors = [
      'mutationobserver',
      'parameter 1 is not of type',
      'failed to execute',
      'web-client-content-script'
    ];

    return this.isPowerPlatform() &&
           this.state.retryCount < this.maxRetries &&
           powerPlatformErrors.some(pattern => errorMessage.includes(pattern));
  }

  private scheduleRetry = () => {
    const delay = Math.pow(2, this.state.retryCount) * 1000; // Exponential backoff
    console.log(`[ErrorBoundary] Scheduling retry ${this.state.retryCount + 1}/${this.maxRetries} in ${delay}ms`);

    const timeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  private handleManualRetry = () => {
    console.log('[ErrorBoundary] Manual retry triggered');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private handleReload = () => {
    console.log('[ErrorBoundary] Page reload triggered');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isPowerPlatform = this.isPowerPlatform();
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card border rounded-lg shadow-lg p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {isPowerPlatform ? '🔧' : '⚠️'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {isPowerPlatform ? 'Power Platform Error' : 'Application Error'}
                </h1>
                <p className="text-muted-foreground">
                  {isPowerPlatform
                    ? 'The application encountered an error in the Power Platform environment.'
                    : 'An unexpected error occurred in the application.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 justify-center flex-wrap">
                {canRetry && (
                  <button
                    onClick={this.handleManualRetry}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </button>
                )}
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {this.state.retryCount > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Retry attempt: {this.state.retryCount}/{this.maxRetries}
                </div>
              )}
            </div>

            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <div className="space-y-3 text-xs">
                <div className="bg-muted p-3 rounded">
                  <div className="font-medium mb-2">Environment:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Platform: {isPowerPlatform ? 'Power Platform' : 'Local Development'}</div>
                    <div>Hostname: {window.location.hostname}</div>
                    <div>Timestamp: {new Date().toISOString()}</div>
                  </div>
                </div>

                {this.state.error && (
                  <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
                    <div className="font-medium mb-2 text-destructive">Error Message:</div>
                    <pre className="text-destructive text-xs whitespace-pre-wrap break-words">
                      {this.state.error.message}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium mb-2">Component Stack:</div>
                    <pre className="text-muted-foreground text-xs whitespace-pre-wrap break-words overflow-x-auto">
                      {this.state.errorInfo.componentStack.split('\n').slice(0, 10).join('\n')}
                      {this.state.errorInfo.componentStack.split('\n').length > 10 && '\n...'}
                    </pre>
                  </div>
                )}
              </div>
            </details>

            {isPowerPlatform && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-1">Power Platform Tips:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• This error may be related to browser extension conflicts</li>
                    <li>• Try disabling browser extensions and reloading</li>
                    <li>• Some Power Platform scripts may interfere with app initialization</li>
                    <li>• The app will automatically retry certain recoverable errors</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;