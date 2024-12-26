import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Safer root element check
const container = document.getElementById('root');

// Fallback if root element is not found
if (!container) {
  console.error('Root element not found. Attempting to create one.');
  const fallbackContainer = document.createElement('div');
  fallbackContainer.id = 'root';
  document.body.appendChild(fallbackContainer);
}

// Ensure we have a container
const rootElement = document.getElementById('root')!;

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Safer Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use a try-catch to prevent registration errors from breaking the app
    try {
      navigator.serviceWorker.register('/service-worker.js', { 
        scope: '/',
        type: 'module'
      }).then(registration => {
        console.log('SW registered:', registration);
      }).catch(error => {
        console.warn('SW registration failed:', error);
      });
    } catch (error) {
      console.warn('Error attempting to register service worker:', error);
    }
  });
}