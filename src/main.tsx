import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react';
import PowerProvider from './PowerProvider.tsx'

createRoot(document.getElementById("root")!).render(
<StrictMode>
  <PowerProvider>
    <App />
  </PowerProvider>
</StrictMode>
);
