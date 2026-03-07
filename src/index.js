import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { register as registerServiceWorker } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA offline support
registerServiceWorker({
  onSuccess: () => console.log('✅ AuraVue is cached for offline use.'),
  onUpdate: () => console.log('🔄 New version of AuraVue is available. Refresh to update.'),
});

// Measure performance — can send to analytics endpoint
reportWebVitals();
