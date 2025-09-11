import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PowerProvider from './PowerProvider.tsx'
import './index.css'
import { StrictMode } from 'react';

// Defensive DOM checking with retry logic
function initializeApp() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.warn('Root element not found, retrying in 100ms...');
    setTimeout(initializeApp, 100);
    return;
  }

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <PowerProvider>
          <App />
        </PowerProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    
    // Fallback: Show basic error message in the root element
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">Failed to initialize the application.</p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
