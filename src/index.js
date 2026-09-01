import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById('root');
const appContent = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, appContent);
} else {
  const root = createRoot(rootElement);
  root.render(appContent);
}

// Register service worker for PWA offline support
registerServiceWorker({
  onSuccess: () => console.log('✅ AuraVue is cached for offline use.'),
  onUpdate: () => console.log('🔄 New version of AuraVue is available. Refresh to update.'),
});

// Measure performance — can send to analytics endpoint
reportWebVitals();
