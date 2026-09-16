import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || dsn.trim() === '') {
    // Sentry is disabled if no DSN provided
    return;
  }

  try {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: 1.0,
      tracePropagationTargets: ['localhost', /^https:\/\/Ciniverse\.app/],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    console.log('[Ciniverse Sentry] Initialized successfully');
  } catch (error) {
    console.warn('[Ciniverse Sentry] Failed to initialize:', error.message);
  }
};
