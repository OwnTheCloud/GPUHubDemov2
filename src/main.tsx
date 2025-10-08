import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PowerProvider from './PowerProvider.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'
import { StrictMode } from 'react';

// Additional error handling for promise rejections (MutationObserver already protected in index.html)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('MutationObserver')) {
    console.warn('[Main] Suppressed MutationObserver promise rejection:', event.reason);
    event.preventDefault();
    return false;
  }
});

// Enhanced defensive DOM checking with exponential backoff retry logic
let retryCount = 0;
const maxRetries = 10;
const baseDelay = 50;

function initializeApp() {
  try {
    // Multiple validation checks for the root element
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(1.5, retryCount);
        retryCount++;
        console.warn(`[App Init] Root element not found, retry ${retryCount}/${maxRetries} in ${delay}ms...`);
        setTimeout(initializeApp, delay);
        return;
      } else {
        console.error('[App Init] Root element never found after maximum retries');
        createFallbackInterface();
        return;
      }
    }

    // Validate root element properties
    if (!rootElement.parentNode) {
      console.warn('[App Init] Root element not properly attached to DOM, waiting...');
      setTimeout(initializeApp, 100);
      return;
    }

    console.log('[App Init] Root element validated, initializing React...');

    // Reset retry count on successful element detection
    retryCount = 0;

    try {
      const root = createRoot(rootElement);
      root.render(
        <StrictMode>
          <ErrorBoundary>
            <PowerProvider>
              <App />
            </PowerProvider>
          </ErrorBoundary>
        </StrictMode>
      );
      console.log('[App Init] React application initialized successfully');
    } catch (reactError) {
      console.error('[App Init] React initialization failed:', reactError);
      handleReactInitError(rootElement, reactError);
    }
  } catch (globalError) {
    console.error('[App Init] Global initialization error:', globalError);
    createFallbackInterface();
  }
}

function handleReactInitError(rootElement: HTMLElement, error: any) {
  console.warn('[App Init] Attempting graceful error recovery...');

  // Clear any partial React content
  rootElement.innerHTML = '';

  // Try a simpler initialization without StrictMode but keep ErrorBoundary
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <PowerProvider>
          <App />
        </PowerProvider>
      </ErrorBoundary>
    );
    console.log('[App Init] React recovered without StrictMode');
  } catch (recoveryError) {
    console.error('[App Init] Recovery attempt failed:', recoveryError);
    createErrorInterface(rootElement, error);
  }
}

function createFallbackInterface() {
  const body = document.body;
  if (!body) {
    console.error('[App Init] Even document.body is not available');
    return;
  }

  body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: #0a0a0a; color: white;">
      <div style="text-align: center; padding: 2rem; max-width: 500px;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem;">Critical Initialization Error</h1>
        <p style="color: #a1a1aa; margin-bottom: 1rem; line-height: 1.5;">
          The application failed to initialize. This may be due to Power Platform environment constraints.
        </p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; margin-right: 0.5rem;">
          Reload Application
        </button>
        <details style="margin-top: 1rem; text-align: left;">
          <summary style="cursor: pointer; color: #60a5fa;">Technical Details</summary>
          <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
            Root element: ${document.getElementById("root") ? "Found" : "Missing"}<br>
            Environment: ${window.location.hostname}<br>
            User Agent: ${navigator.userAgent.substring(0, 50)}...
          </p>
        </details>
      </div>
    </div>
  `;
}

function createErrorInterface(rootElement: HTMLElement, error: any) {
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: #0a0a0a; color: white;">
      <div style="text-align: center; padding: 2rem; max-width: 500px;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">🔧</div>
        <h1 style="color: #f59e0b; margin-bottom: 1rem;">React Initialization Error</h1>
        <p style="color: #a1a1aa; margin-bottom: 1rem;">The React application encountered an error during startup.</p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
          Reload Page
        </button>
        <details style="margin-top: 1rem; text-align: left;">
          <summary style="cursor: pointer; color: #60a5fa;">Error Details</summary>
          <pre style="margin-top: 0.5rem; font-size: 0.75rem; color: #ef4444; white-space: pre-wrap; overflow-wrap: break-word;">
${error?.message || 'Unknown error'}
          </pre>
        </details>
      </div>
    </div>
  `;
}

// Enhanced initialization with Power Platform timing consideration
function safeInitialize() {
  // Allow Power Platform scripts some time to load before React initialization
  const isPowerPlatform = window.location.hostname.includes('powerapps.com') ||
                         window.location.hostname.includes('powerplatformusercontent.com');

  if (isPowerPlatform) {
    console.log('[App Init] Power Platform detected, allowing extra initialization time...');
    // Give Power Platform scripts time to load and potentially error out
    setTimeout(initializeApp, 200);
  } else {
    console.log('[App Init] Local environment, initializing immediately');
    initializeApp();
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
  safeInitialize();
}
