import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initSentry } from './services/sentry';
import App from './App';
import './index.css';

// Initialize Sentry error reporting if DSN configured
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <AuthProvider>
            <WebSocketProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </WebSocketProvider>
          </AuthProvider>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
