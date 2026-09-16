import '@testing-library/jest-dom';
import { server } from './mocks/server';

// MSW Server Lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Polyfill AbortSignal for jsdom Node 24 compatibility with RTK Query
if (typeof window !== 'undefined') {
  window.AbortSignal = globalThis.AbortSignal;
  window.AbortController = globalThis.AbortController;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }
  postMessage() {}
  close() {}
}
window.BroadcastChannel = MockBroadcastChannel;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollTo
window.HTMLElement.prototype.scrollTo = () => {};
